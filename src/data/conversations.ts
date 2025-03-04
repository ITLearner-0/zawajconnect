
import { Conversation } from '@/types/profile';

// Dummy conversations for demo
export const dummyConversations: Conversation[] = [
  {
    id: 'conv-1',
    created_at: '2023-08-01T10:00:00Z',
    participants: ['current-user', 'user-1'],
    profile: {
      first_name: 'Ahmed',
      last_name: 'Khan'
    },
    wali_supervised: false,
    last_message: {
      id: 'msg-5',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      content: 'Looking forward to our coffee meetup tomorrow!',
      created_at: '2023-08-10T09:30:00Z',
      is_read: false,
      is_wali_visible: false
    }
  },
  {
    id: 'conv-2',
    created_at: '2023-07-25T14:30:00Z',
    participants: ['current-user', 'user-2'],
    profile: {
      first_name: 'Fatima',
      last_name: 'Rahman'
    },
    wali_supervised: true,
    last_message: {
      id: 'msg-10',
      conversation_id: 'conv-2',
      sender_id: 'current-user',
      content: 'I agree, having strong Islamic values is very important in a marriage.',
      created_at: '2023-08-09T18:45:00Z',
      is_read: true,
      is_wali_visible: true
    }
  },
  {
    id: 'conv-3',
    created_at: '2023-08-05T09:15:00Z',
    participants: ['current-user', 'user-3'],
    profile: {
      first_name: 'Yusuf',
      last_name: 'Ali'
    },
    wali_supervised: false,
    last_message: {
      id: 'msg-15',
      conversation_id: 'conv-3',
      sender_id: 'user-3',
      content: 'I can share some books about Islamic marriage that I found helpful.',
      created_at: '2023-08-10T11:20:00Z',
      is_read: false,
      is_wali_visible: false
    }
  },
  {
    id: 'conv-4',
    created_at: '2023-07-20T16:45:00Z',
    participants: ['current-user', 'user-4'],
    profile: {
      first_name: 'Aisha',
      last_name: 'Mahmood'
    },
    wali_supervised: true,
    last_message: {
      id: 'msg-20',
      conversation_id: 'conv-4',
      sender_id: 'current-user',
      content: 'Would you be interested in having a video call with our families?',
      created_at: '2023-08-08T20:10:00Z',
      is_read: true,
      is_wali_visible: true
    }
  }
];
