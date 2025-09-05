-- Add family supervision support to messages table
ALTER TABLE messages 
ADD COLUMN family_member_id uuid REFERENCES family_members(id),
ADD COLUMN is_family_supervised boolean DEFAULT false;

-- Create conversation participants table to track family involvement
CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id),
  participant_id uuid NOT NULL,
  participant_type text NOT NULL CHECK (participant_type IN ('user', 'family_member')),
  family_member_id uuid REFERENCES family_members(id),
  user_id uuid NOT NULL,
  can_send_messages boolean DEFAULT true,
  can_read_messages boolean DEFAULT true,
  joined_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on conversation_participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;