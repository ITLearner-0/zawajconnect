import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebSocketMessage {
  type: 'message' | 'typing' | 'presence' | 'join' | 'leave';
  data: any;
  userId?: string;
  conversationId?: string;
  timestamp: number;
}

interface ConnectedClient {
  socket: WebSocket;
  userId: string;
  conversationId?: string;
  lastPing: number;
}

// Map des clients connectés
const connectedClients = new Map<string, ConnectedClient>();
const conversationRooms = new Map<string, Set<string>>();

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get('upgrade') || '';

  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 400 });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const conversationId = url.searchParams.get('conversationId');
  const token = url.searchParams.get('token');

  if (!userId || !token) {
    return new Response('Missing required parameters', { status: 400 });
  }

  // Vérifier l'authentification
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user || user.id !== userId) {
    return new Response('Authentication failed', { status: 401 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const clientId = crypto.randomUUID();

  // Configuration du client
  const client: ConnectedClient = {
    socket,
    userId,
    conversationId,
    lastPing: Date.now(),
  };

  socket.onopen = () => {
    console.log(`WebSocket connected: ${clientId} (user: ${userId})`);
    connectedClients.set(clientId, client);

    // Joindre la conversation si spécifiée
    if (conversationId) {
      joinConversation(clientId, conversationId);
    }

    // Envoyer confirmation de connexion
    sendToClient(clientId, {
      type: 'join',
      data: { status: 'connected', clientId },
      timestamp: Date.now(),
    });
  };

  socket.onmessage = async (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      await handleMessage(clientId, message);
    } catch (error) {
      console.error('Error handling message:', error);
      sendToClient(clientId, {
        type: 'error',
        data: { error: 'Invalid message format' },
        timestamp: Date.now(),
      });
    }
  };

  socket.onclose = () => {
    console.log(`WebSocket disconnected: ${clientId}`);
    handleDisconnection(clientId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    handleDisconnection(clientId);
  };

  return response;
});

// Gérer les messages entrants
async function handleMessage(clientId: string, message: WebSocketMessage) {
  const client = connectedClients.get(clientId);
  if (!client) return;

  client.lastPing = Date.now();

  switch (message.type) {
    case 'message':
      await handleChatMessage(clientId, message);
      break;

    case 'typing':
      handleTypingIndicator(clientId, message);
      break;

    case 'presence':
      handlePresenceUpdate(clientId, message);
      break;

    case 'join':
      if (message.conversationId) {
        joinConversation(clientId, message.conversationId);
      }
      break;

    case 'leave':
      if (message.conversationId) {
        leaveConversation(clientId, message.conversationId);
      }
      break;

    default:
      console.warn(`Unknown message type: ${message.type}`);
  }
}

// Gérer les messages de chat
async function handleChatMessage(clientId: string, message: WebSocketMessage) {
  const client = connectedClients.get(clientId);
  if (!client || !message.conversationId) return;

  // Enregistrer le message en base de données
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: message.conversationId,
      sender_id: client.userId,
      content: message.data.content,
      message_type: message.data.type || 'text',
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    sendToClient(clientId, {
      type: 'error',
      data: { error: 'Failed to save message' },
      timestamp: Date.now(),
    });
    return;
  }

  // Diffuser le message aux autres clients de la conversation
  broadcastToConversation(
    message.conversationId,
    {
      type: 'message',
      data: data,
      timestamp: Date.now(),
    },
    clientId
  );
}

// Gérer les indicateurs de frappe
function handleTypingIndicator(clientId: string, message: WebSocketMessage) {
  const client = connectedClients.get(clientId);
  if (!client || !message.conversationId) return;

  broadcastToConversation(
    message.conversationId,
    {
      type: 'typing',
      data: {
        userId: client.userId,
        isTyping: message.data.isTyping,
      },
      timestamp: Date.now(),
    },
    clientId
  );
}

// Gérer les mises à jour de présence
function handlePresenceUpdate(clientId: string, message: WebSocketMessage) {
  const client = connectedClients.get(clientId);
  if (!client) return;

  // Diffuser le statut de présence
  broadcastToAllConnected(
    {
      type: 'presence',
      data: {
        userId: client.userId,
        status: message.data.status,
        lastSeen: Date.now(),
      },
      timestamp: Date.now(),
    },
    clientId
  );
}

// Joindre une conversation
function joinConversation(clientId: string, conversationId: string) {
  const client = connectedClients.get(clientId);
  if (!client) return;

  client.conversationId = conversationId;

  if (!conversationRooms.has(conversationId)) {
    conversationRooms.set(conversationId, new Set());
  }

  conversationRooms.get(conversationId)!.add(clientId);

  console.log(`Client ${clientId} joined conversation ${conversationId}`);
}

// Quitter une conversation
function leaveConversation(clientId: string, conversationId: string) {
  const room = conversationRooms.get(conversationId);
  if (room) {
    room.delete(clientId);
    if (room.size === 0) {
      conversationRooms.delete(conversationId);
    }
  }

  const client = connectedClients.get(clientId);
  if (client && client.conversationId === conversationId) {
    client.conversationId = undefined;
  }

  console.log(`Client ${clientId} left conversation ${conversationId}`);
}

// Envoyer un message à un client spécifique
function sendToClient(clientId: string, message: WebSocketMessage) {
  const client = connectedClients.get(clientId);
  if (client && client.socket.readyState === WebSocket.OPEN) {
    try {
      client.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      handleDisconnection(clientId);
    }
  }
}

// Diffuser à tous les clients d'une conversation
function broadcastToConversation(
  conversationId: string,
  message: WebSocketMessage,
  excludeClientId?: string
) {
  const room = conversationRooms.get(conversationId);
  if (!room) return;

  room.forEach((clientId) => {
    if (clientId !== excludeClientId) {
      sendToClient(clientId, message);
    }
  });
}

// Diffuser à tous les clients connectés
function broadcastToAllConnected(message: WebSocketMessage, excludeClientId?: string) {
  connectedClients.forEach((client, clientId) => {
    if (clientId !== excludeClientId) {
      sendToClient(clientId, message);
    }
  });
}

// Gérer la déconnexion
function handleDisconnection(clientId: string) {
  const client = connectedClients.get(clientId);
  if (!client) return;

  // Quitter toutes les conversations
  if (client.conversationId) {
    leaveConversation(clientId, client.conversationId);
  }

  // Notifier la déconnexion
  broadcastToAllConnected(
    {
      type: 'presence',
      data: {
        userId: client.userId,
        status: 'offline',
        lastSeen: Date.now(),
      },
      timestamp: Date.now(),
    },
    clientId
  );

  connectedClients.delete(clientId);
}

// Nettoyage périodique des connexions fermées
setInterval(() => {
  const now = Date.now();
  const timeout = 60000; // 1 minute

  connectedClients.forEach((client, clientId) => {
    if (now - client.lastPing > timeout || client.socket.readyState !== WebSocket.OPEN) {
      console.log(`Cleaning up stale connection: ${clientId}`);
      handleDisconnection(clientId);
    }
  });
}, 30000); // Vérifier toutes les 30 secondes
