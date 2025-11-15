/**
 * WebRTC Signaling Service
 *
 * Handles WebRTC peer-to-peer connection establishment using Supabase Realtime
 * as the signaling channel for exchanging SDP offers/answers and ICE candidates.
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type CallType = 'audio' | 'video';
export type CallState =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'ended'
  | 'rejected'
  | 'failed';
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface QualityMetrics {
  packetsLost: number;
  jitter: number;
  rtt: number;
  bitrate: number;
  quality: ConnectionQuality;
}

export interface VideoConstraints {
  width: number;
  height: number;
  frameRate: number;
}

export interface CallOffer {
  sdp: RTCSessionDescriptionInit;
  callType: CallType;
  callerId: string;
  callerName: string;
}

export interface CallAnswer {
  sdp: RTCSessionDescriptionInit;
}

export interface ICECandidateMessage {
  candidate: RTCIceCandidateInit;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-end' | 'call-reject';
  payload: CallOffer | CallAnswer | ICECandidateMessage | null;
  senderId: string;
}

/**
 * WebRTC Signaling Service Class
 * Manages peer-to-peer connection establishment and media streaming
 */
export class WebRTCSignalingService {
  private channel: RealtimeChannel | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private matchId: string;
  private userId: string;
  private iceCandidateQueue: RTCIceCandidateInit[] = [];
  private isRemoteDescriptionSet = false;

  // Quality monitoring
  private qualityMonitorInterval: NodeJS.Timeout | null = null;
  private currentQualityMetrics: QualityMetrics | null = null;
  private currentVideoConstraints: VideoConstraints = { width: 1280, height: 720, frameRate: 30 };

  // Retry mechanism
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // Callbacks
  public onCallStateChange?: (state: CallState) => void;
  public onLocalStream?: (stream: MediaStream) => void;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onIncomingCall?: (offer: CallOffer) => void;
  public onCallEnd?: () => void;
  public onError?: (error: Error) => void;
  public onQualityChange?: (metrics: QualityMetrics) => void;

  // WebRTC Configuration with TURN servers for restrictive networks
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      // STUN servers (free)
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // TURN servers (metered.ca - free tier)
      {
        urls: 'turn:a.relay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:a.relay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:a.relay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
    iceTransportPolicy: 'all', // Try all connection methods
    iceCandidatePoolSize: 10,
  };

  constructor(matchId: string, userId: string) {
    this.matchId = matchId;
    this.userId = userId;
  }

  /**
   * Initialize the signaling channel and start listening for incoming calls
   */
  async initialize(): Promise<void> {
    try {
      // Create Supabase Realtime channel for this match
      this.channel = supabase.channel(`webrtc:${this.matchId}`, {
        config: {
          broadcast: { self: false }, // Don't receive our own messages
        },
      });

      // Listen for incoming call signals
      this.channel.on('broadcast', { event: 'call-offer' }, async ({ payload }) => {
        console.log('📞 Received call offer:', payload);
        if (payload.senderId !== this.userId) {
          await this.handleIncomingOffer(payload.payload as CallOffer);
        }
      });

      this.channel.on('broadcast', { event: 'call-answer' }, async ({ payload }) => {
        console.log('📞 Received call answer:', payload);
        if (payload.senderId !== this.userId) {
          await this.handleIncomingAnswer(payload.payload as CallAnswer);
        }
      });

      this.channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.senderId !== this.userId) {
          await this.handleIncomingICECandidate(payload.payload as ICECandidateMessage);
        }
      });

      this.channel.on('broadcast', { event: 'call-end' }, ({ payload }) => {
        console.log('📞 Call ended by remote peer');
        if (payload.senderId !== this.userId) {
          this.handleCallEnd();
        }
      });

      this.channel.on('broadcast', { event: 'call-reject' }, ({ payload }) => {
        console.log('📞 Call rejected by remote peer');
        if (payload.senderId !== this.userId) {
          this.onCallStateChange?.('rejected');
          this.cleanup();
        }
      });

      // Subscribe to the channel
      await this.channel.subscribe();
      console.log('✅ Signaling channel initialized for match:', this.matchId);
    } catch (error) {
      console.error('❌ Failed to initialize signaling channel:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Initiate an outgoing call
   */
  async initiateCall(callType: CallType, callerName: string): Promise<void> {
    try {
      console.log(`📞 Initiating ${callType} call...`);
      this.onCallStateChange?.('calling');

      // Get local media stream with quality constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video:
          callType === 'video'
            ? {
                width: { ideal: this.currentVideoConstraints.width },
                height: { ideal: this.currentVideoConstraints.height },
                frameRate: { ideal: this.currentVideoConstraints.frameRate },
              }
            : false,
      };

      this.localStream = await this.getUserMediaWithRetry(constraints);

      this.onLocalStream?.(this.localStream);

      // Create peer connection
      await this.createPeerConnection();

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Create and send offer
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });

      await this.peerConnection!.setLocalDescription(offer);

      // Send offer via signaling channel
      await this.sendSignal('call-offer', {
        sdp: offer,
        callType,
        callerId: this.userId,
        callerName,
      });

      console.log('✅ Call offer sent');
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      this.onCallStateChange?.('failed');
      this.onError?.(error as Error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Accept an incoming call
   */
  async acceptCall(callType: CallType): Promise<void> {
    try {
      console.log(`📞 Accepting ${callType} call...`);
      this.onCallStateChange?.('connecting');

      // Get local media stream with quality constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video:
          callType === 'video'
            ? {
                width: { ideal: this.currentVideoConstraints.width },
                height: { ideal: this.currentVideoConstraints.height },
                frameRate: { ideal: this.currentVideoConstraints.frameRate },
              }
            : false,
      };

      this.localStream = await this.getUserMediaWithRetry(constraints);

      this.onLocalStream?.(this.localStream);

      // Add local tracks to existing peer connection
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Create and send answer
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      // Send answer via signaling channel
      await this.sendSignal('call-answer', {
        sdp: answer,
      });

      console.log('✅ Call answer sent');
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      this.onCallStateChange?.('failed');
      this.onError?.(error as Error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(): Promise<void> {
    console.log('📞 Rejecting call...');
    await this.sendSignal('call-reject', null);
    this.cleanup();
  }

  /**
   * End an ongoing call
   */
  async endCall(): Promise<void> {
    console.log('📞 Ending call...');
    await this.sendSignal('call-end', null);
    this.onCallStateChange?.('ended');
    this.cleanup();
  }

  /**
   * Toggle microphone on/off
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle camera on/off
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // ========== Private Methods ==========

  /**
   * Create RTCPeerConnection and set up event handlers
   */
  private async createPeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate');
        this.sendSignal('ice-candidate', {
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📺 Received remote track');
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        this.onRemoteStream?.(this.remoteStream);
      }
      this.remoteStream.addTrack(event.track);
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      console.log('🔌 Connection state:', state);

      switch (state) {
        case 'connected':
          this.onCallStateChange?.('connected');
          this.reconnectAttempts = 0; // Reset on successful connection
          this.startQualityMonitoring();
          break;
        case 'disconnected':
          console.warn('⚠️ Connection disconnected, attempting reconnect...');
          this.attemptReconnect();
          break;
        case 'failed':
          console.error('❌ Connection failed');
          if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.attemptReconnect();
          } else {
            this.onCallStateChange?.('failed');
            this.cleanup();
          }
          break;
        case 'closed':
          this.onCallStateChange?.('ended');
          break;
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection!.iceConnectionState);
    };
  }

  /**
   * Handle incoming call offer
   */
  private async handleIncomingOffer(offer: CallOffer): Promise<void> {
    try {
      console.log('📞 Handling incoming call offer');
      this.onCallStateChange?.('ringing');

      // Create peer connection
      await this.createPeerConnection();

      // Set remote description
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer.sdp));
      this.isRemoteDescriptionSet = true;

      // Process queued ICE candidates
      await this.processICECandidateQueue();

      // Notify about incoming call
      this.onIncomingCall?.(offer);
    } catch (error) {
      console.error('❌ Failed to handle incoming offer:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Handle incoming call answer
   */
  private async handleIncomingAnswer(answer: CallAnswer): Promise<void> {
    try {
      console.log('📞 Handling incoming call answer');
      this.onCallStateChange?.('connecting');

      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(answer.sdp));
      this.isRemoteDescriptionSet = true;

      // Process queued ICE candidates
      await this.processICECandidateQueue();
    } catch (error) {
      console.error('❌ Failed to handle incoming answer:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIncomingICECandidate(message: ICECandidateMessage): Promise<void> {
    try {
      const candidate = new RTCIceCandidate(message.candidate);

      if (this.peerConnection && this.isRemoteDescriptionSet) {
        await this.peerConnection.addIceCandidate(candidate);
        console.log('🧊 ICE candidate added');
      } else {
        // Queue candidate if remote description not set yet
        this.iceCandidateQueue.push(message.candidate);
        console.log('🧊 ICE candidate queued (remote description not set)');
      }
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error);
    }
  }

  /**
   * Process queued ICE candidates
   */
  private async processICECandidateQueue(): Promise<void> {
    while (this.iceCandidateQueue.length > 0) {
      const candidateInit = this.iceCandidateQueue.shift()!;
      try {
        await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidateInit));
        console.log('🧊 Queued ICE candidate added');
      } catch (error) {
        console.error('❌ Failed to add queued ICE candidate:', error);
      }
    }
  }

  /**
   * Handle call end from remote peer
   */
  private handleCallEnd(): void {
    this.onCallStateChange?.('ended');
    this.onCallEnd?.();
    this.cleanup();
  }

  /**
   * Send signal via Supabase Realtime channel
   */
  private async sendSignal(event: string, payload: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Signaling channel not initialized');
    }

    await this.channel.send({
      type: 'broadcast',
      event,
      payload: {
        senderId: this.userId,
        payload,
      },
    });
  }

  /**
   * Get user media with exponential backoff retry
   */
  private async getUserMediaWithRetry(
    constraints: MediaStreamConstraints,
    attempt = 1
  ): Promise<MediaStream> {
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY = 1000;

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error(`❌ getUserMedia attempt ${attempt} failed:`, error);

      if (attempt < MAX_ATTEMPTS) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.getUserMediaWithRetry(constraints, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Attempt to reconnect after connection failure
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Reconnection attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} in ${delay}ms...`
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        // Attempt to restart ICE
        if (this.peerConnection) {
          this.peerConnection.restartIce();
          console.log('🔄 ICE restart initiated');
        }
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
      }
    }, delay);
  }

  /**
   * Start monitoring connection quality
   */
  private startQualityMonitoring(): void {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
    }

    this.qualityMonitorInterval = setInterval(async () => {
      await this.checkConnectionQuality();
    }, 2000); // Check every 2 seconds

    console.log('📊 Quality monitoring started');
  }

  /**
   * Stop monitoring connection quality
   */
  private stopQualityMonitoring(): void {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }
    console.log('📊 Quality monitoring stopped');
  }

  /**
   * Check connection quality using getStats()
   */
  private async checkConnectionQuality(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const stats = await this.peerConnection.getStats();
      let packetsLost = 0;
      let packetsReceived = 0;
      let jitter = 0;
      let rtt = 0;
      let bitrate = 0;
      let bytesReceived = 0;

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp') {
          packetsLost += report.packetsLost || 0;
          packetsReceived += report.packetsReceived || 0;
          jitter += report.jitter || 0;
          bytesReceived += report.bytesReceived || 0;
        }

        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          rtt = report.currentRoundTripTime * 1000 || 0; // Convert to ms
        }
      });

      // Calculate bitrate (simple approximation)
      if (this.currentQualityMetrics) {
        const timeDiff = 2; // 2 seconds between checks
        const bytesDiff = bytesReceived - (this.currentQualityMetrics.bitrate / 8) * timeDiff;
        bitrate = (bytesDiff * 8) / timeDiff; // bits per second
      }

      // Calculate packet loss percentage
      const packetLossPercentage =
        packetsReceived > 0 ? (packetsLost / (packetsLost + packetsReceived)) * 100 : 0;

      // Determine quality level
      let quality: ConnectionQuality = 'excellent';
      if (packetLossPercentage > 5 || rtt > 300 || jitter > 0.05) {
        quality = 'poor';
      } else if (packetLossPercentage > 2 || rtt > 150 || jitter > 0.03) {
        quality = 'fair';
      } else if (packetLossPercentage > 0.5 || rtt > 100 || jitter > 0.02) {
        quality = 'good';
      }

      this.currentQualityMetrics = {
        packetsLost,
        jitter: jitter * 1000, // Convert to ms
        rtt,
        bitrate,
        quality,
      };

      console.log('📊 Quality metrics:', this.currentQualityMetrics);
      this.onQualityChange?.(this.currentQualityMetrics);

      // Adjust quality if needed
      await this.adjustQualityBasedOnMetrics(quality);
    } catch (error) {
      console.error('❌ Failed to get connection stats:', error);
    }
  }

  /**
   * Adjust video quality based on connection metrics
   */
  private async adjustQualityBasedOnMetrics(quality: ConnectionQuality): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    let newConstraints: VideoConstraints;

    switch (quality) {
      case 'poor':
        newConstraints = { width: 640, height: 360, frameRate: 15 };
        break;
      case 'fair':
        newConstraints = { width: 854, height: 480, frameRate: 24 };
        break;
      case 'good':
        newConstraints = { width: 1280, height: 720, frameRate: 30 };
        break;
      case 'excellent':
        newConstraints = { width: 1280, height: 720, frameRate: 30 };
        break;
    }

    // Only adjust if constraints changed
    if (JSON.stringify(newConstraints) === JSON.stringify(this.currentVideoConstraints)) {
      return;
    }

    try {
      await videoTrack.applyConstraints({
        width: { ideal: newConstraints.width },
        height: { ideal: newConstraints.height },
        frameRate: { ideal: newConstraints.frameRate },
      });

      this.currentVideoConstraints = newConstraints;
      console.log(`🎥 Video quality adjusted to ${quality}:`, newConstraints);
    } catch (error) {
      console.error('❌ Failed to adjust video quality:', error);
    }
  }

  /**
   * Get current quality metrics
   */
  getCurrentQuality(): QualityMetrics | null {
    return this.currentQualityMetrics;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up WebRTC resources...');

    // Stop quality monitoring
    this.stopQualityMonitoring();

    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Unsubscribe from channel
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }

    // Reset state
    this.remoteStream = null;
    this.iceCandidateQueue = [];
    this.isRemoteDescriptionSet = false;
    this.reconnectAttempts = 0;
    this.currentQualityMetrics = null;

    console.log('✅ Cleanup complete');
  }
}
