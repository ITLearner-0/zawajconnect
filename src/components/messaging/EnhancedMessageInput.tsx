
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, Lock, Timer, Mic, BookOpen, Calendar, Shield } from 'lucide-react';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import IslamicContentSharing from './IslamicContentSharing';
import CallScheduler from './CallScheduler';
import TemporaryMessageSettings from './TemporaryMessageSettings';

interface IslamicContent {
  id: string;
  type: 'quran' | 'hadith';
  arabic: string;
  translation: string;
  reference: string;
  category?: string;
}

interface CallScheduleData {
  type: 'audio' | 'video';
  date: string;
  time: string;
  duration: number;
  includeWali: boolean;
  notes?: string;
  timezone?: string;
}

interface TemporaryMessageSettings {
  enabled: boolean;
  defaultDuration: number;
  allowCustomDuration: boolean;
  warnBeforeExpiry: boolean;
  warningTime: number;
}

interface EnhancedMessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  sendingMessage: boolean;
  encryptionEnabled: boolean;
  otherUserName: string;
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  onShareIslamicContent: (content: IslamicContent) => void;
  onScheduleCall: (scheduleData: CallScheduleData) => void;
  isWaliRequired?: boolean;
  temporaryMessageSettings: TemporaryMessageSettings;
  onTemporarySettingsChange: (settings: TemporaryMessageSettings) => void;
}

const TEMP_DURATION_OPTIONS = [
  { value: 1, label: '1h' },
  { value: 6, label: '6h' },
  { value: 24, label: '1j' },
  { value: 168, label: '1s' }
];

const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  messageInput,
  setMessageInput,
  sendMessage,
  sendingMessage,
  encryptionEnabled,
  otherUserName,
  onSendVoiceMessage,
  onShareIslamicContent,
  onScheduleCall,
  isWaliRequired = false,
  temporaryMessageSettings,
  onTemporarySettingsChange
}) => {
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [selectedTempDuration, setSelectedTempDuration] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.trim()) {
        sendMessage();
      }
    }
  };

  const handleSend = () => {
    if (messageInput.trim()) {
      // Here you would handle temporary message settings
      if (temporaryMessageSettings.enabled && selectedTempDuration) {
        // Add temporary message metadata
        console.log('Sending temporary message with duration:', selectedTempDuration);
      }
      sendMessage();
    }
  };

  return (
    <div className="p-3 border-t bg-background">
      {/* Voice Recording Mode */}
      {isRecordingMode ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mode Vocal</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecordingMode(false)}
            >
              Texte
            </Button>
          </div>
          <VoiceMessageRecorder
            onSendVoiceMessage={onSendVoiceMessage}
            disabled={sendingMessage}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Main Input Row */}
          <div className="flex items-center gap-2">
            {/* Encryption Indicator */}
            {encryptionEnabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-green-600" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Chiffré de bout en bout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Temporary Message Duration */}
            {temporaryMessageSettings.enabled && (
              <Select
                value={selectedTempDuration?.toString() || 'none'}
                onValueChange={(value) => 
                  setSelectedTempDuration(value === 'none' ? null : parseInt(value))
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      ∞
                    </div>
                  </SelectItem>
                  {TEMP_DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Text Input */}
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Tapez votre message${encryptionEnabled ? ' (chiffré)' : ''}...`}
              className="flex-grow"
              disabled={sendingMessage}
            />

            {/* Send Button */}
            <Button 
              onClick={handleSend} 
              disabled={sendingMessage || !messageInput.trim()} 
              size="sm"
            >
              {sendingMessage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Voice Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecordingMode(true)}
            >
              <Mic className="h-4 w-4 mr-1" />
              Vocal
            </Button>

            {/* Islamic Content Sharing */}
            <IslamicContentSharing onShareContent={onShareIslamicContent} />

            {/* Call Scheduler */}
            <CallScheduler
              onScheduleCall={onScheduleCall}
              otherUserName={otherUserName}
              isWaliRequired={isWaliRequired}
            />

            {/* Temporary Message Settings */}
            <TemporaryMessageSettings
              settings={temporaryMessageSettings}
              onSettingsChange={onTemporarySettingsChange}
            />
          </div>

          {/* Status Indicators */}
          {(encryptionEnabled || temporaryMessageSettings.enabled || selectedTempDuration) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {encryptionEnabled && (
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-green-600" />
                  <span>Chiffré</span>
                </div>
              )}
              
              {selectedTempDuration && (
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3 text-orange-600" />
                  <span>Expire dans {TEMP_DURATION_OPTIONS.find(o => o.value === selectedTempDuration)?.label}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageInput;
