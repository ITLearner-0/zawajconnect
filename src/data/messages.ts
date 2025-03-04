
import { Message } from '@/types/profile';

// Dummy messages for each conversation
export const dummyMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'current-user',
      content: 'Assalamu alaikum! I noticed we have similar interests. Would you like to chat?',
      created_at: '2023-08-01T10:05:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      content: 'Walaikum assalam! Yes, I would like that. Tell me more about yourself.',
      created_at: '2023-08-01T10:30:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-3',
      conversation_id: 'conv-1',
      sender_id: 'current-user',
      content: 'I work in technology and am passionate about community service. I enjoy hiking and reading in my spare time.',
      created_at: '2023-08-05T14:20:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-4',
      conversation_id: 'conv-1',
      sender_id: 'current-user',
      content: 'Would you like to meet for coffee sometime?',
      created_at: '2023-08-08T16:45:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-5',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      content: 'Looking forward to our coffee meetup tomorrow!',
      created_at: '2023-08-10T09:30:00Z',
      is_read: false,
      is_wali_visible: false
    }
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversation_id: 'conv-2',
      sender_id: 'user-2',
      content: 'Assalamu alaikum! I read your profile and was impressed by your commitment to Islamic values.',
      created_at: '2023-07-25T14:35:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-7',
      conversation_id: 'conv-2',
      sender_id: 'current-user',
      content: 'Walaikum assalam! Thank you, I believe that\'s essential in finding a compatible spouse.',
      created_at: '2023-07-26T09:10:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-8',
      conversation_id: 'conv-2',
      sender_id: 'user-2',
      content: 'I agree. What are some important qualities you\'re looking for in a spouse?',
      created_at: '2023-08-02T12:25:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-9',
      conversation_id: 'conv-2',
      sender_id: 'user-2',
      content: 'For me, I value someone who prioritizes their deen, is kind, and has good family values.',
      created_at: '2023-08-05T16:30:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-10',
      conversation_id: 'conv-2',
      sender_id: 'current-user',
      content: 'I agree, having strong Islamic values is very important in a marriage.',
      created_at: '2023-08-09T18:45:00Z',
      is_read: true,
      is_wali_visible: true
    }
  ],
  'conv-3': [
    {
      id: 'msg-11',
      conversation_id: 'conv-3',
      sender_id: 'current-user',
      content: 'Assalamu alaikum! I noticed you\'re a doctor. I have a lot of respect for healthcare professionals.',
      created_at: '2023-08-05T09:20:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-12',
      conversation_id: 'conv-3',
      sender_id: 'user-3',
      content: 'Walaikum assalam! Thank you. It\'s challenging but rewarding work. What field are you in?',
      created_at: '2023-08-05T11:05:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-13',
      conversation_id: 'conv-3',
      sender_id: 'current-user',
      content: 'I work in education. I\'m interested in how you balance your busy career with religious practices.',
      created_at: '2023-08-06T13:40:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-14',
      conversation_id: 'conv-3',
      sender_id: 'user-3',
      content: 'It\'s all about time management and prioritization. I find that my faith actually helps me be more focused and compassionate in my work.',
      created_at: '2023-08-08T19:15:00Z',
      is_read: true,
      is_wali_visible: false
    },
    {
      id: 'msg-15',
      conversation_id: 'conv-3',
      sender_id: 'user-3',
      content: 'I can share some books about Islamic marriage that I found helpful.',
      created_at: '2023-08-10T11:20:00Z',
      is_read: false,
      is_wali_visible: false
    }
  ],
  'conv-4': [
    {
      id: 'msg-16',
      conversation_id: 'conv-4',
      sender_id: 'user-4',
      content: 'Assalamu alaikum! I enjoyed reading your profile and would like to get to know you better.',
      created_at: '2023-07-20T16:50:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-17',
      conversation_id: 'conv-4',
      sender_id: 'current-user',
      content: 'Walaikum assalam! Thank you for reaching out. I\'d be happy to chat and see if we might be compatible.',
      created_at: '2023-07-21T10:15:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-18',
      conversation_id: 'conv-4',
      sender_id: 'user-4',
      content: 'Great! I believe family is very important in a marriage. How do you envision your future family life?',
      created_at: '2023-07-25T13:30:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-19',
      conversation_id: 'conv-4',
      sender_id: 'current-user',
      content: 'I see a home centered around Islamic values, mutual respect, and open communication. I think it\'s important that both spouses support each other\'s goals while building a strong family foundation.',
      created_at: '2023-08-01T11:45:00Z',
      is_read: true,
      is_wali_visible: true
    },
    {
      id: 'msg-20',
      conversation_id: 'conv-4',
      sender_id: 'current-user',
      content: 'Would you be interested in having a video call with our families?',
      created_at: '2023-08-08T20:10:00Z',
      is_read: true,
      is_wali_visible: true
    }
  ]
};
