-- Add family supervision to messages and conversations
-- This ensures Islamic compliance where family members can participate in conversations

-- Add family member tracking to messages
ALTER TABLE messages 
ADD COLUMN family_member_id uuid REFERENCES family_members(id),
ADD COLUMN is_family_supervised boolean DEFAULT false;

-- Create conversation participants table to track family involvement
CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id),
  participant_id uuid NOT NULL, -- Can be user_id or family_member_id
  participant_type text NOT NULL CHECK (participant_type IN ('user', 'family_member')),
  family_member_id uuid REFERENCES family_members(id), -- Only used when participant_type = 'family_member'
  user_id uuid NOT NULL, -- The user this participant belongs to
  can_send_messages boolean DEFAULT true,
  can_read_messages boolean DEFAULT true,
  joined_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on conversation_participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation participants
CREATE POLICY "Users can view participants in their matches" 
ON conversation_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM matches 
    WHERE matches.id = conversation_participants.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

CREATE POLICY "Family members can view participants in supervised matches" 
ON conversation_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    JOIN matches m ON (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
    WHERE m.id = conversation_participants.match_id 
    AND fm.user_id IN (
      SELECT matches.user1_id FROM matches WHERE matches.id = conversation_participants.match_id
      UNION
      SELECT matches.user2_id FROM matches WHERE matches.id = conversation_participants.match_id
    )
  )
);

CREATE POLICY "Users can add participants to their matches" 
ON conversation_participants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM matches 
    WHERE matches.id = conversation_participants.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update participants in their matches" 
ON conversation_participants 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM matches 
    WHERE matches.id = conversation_participants.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Update messages table policies to handle family supervision
-- Allow family members to send messages if they have permission
CREATE POLICY "Family members can send supervised messages" 
ON messages 
FOR INSERT 
WITH CHECK (
  -- Check if the family member has permission to communicate
  (family_member_id IS NOT NULL AND 
   EXISTS (
     SELECT 1 FROM family_members fm
     WHERE fm.id = family_member_id 
     AND fm.can_communicate = true
     AND EXISTS (
       SELECT 1 FROM matches m 
       WHERE m.id = messages.match_id 
       AND (m.user1_id = fm.user_id OR m.user2_id = fm.user_id)
     )
   ))
  OR
  -- Original policy for regular users
  (family_member_id IS NULL AND auth.uid() = sender_id AND 
   EXISTS (
     SELECT 1 FROM matches 
     WHERE matches.id = messages.match_id 
     AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid()) 
     AND matches.is_mutual = true
   ))
);

-- Allow family members to read messages in supervised conversations
CREATE POLICY "Family members can read supervised messages" 
ON messages 
FOR SELECT 
USING (
  -- Original policy for users in the match
  EXISTS (
    SELECT 1 FROM matches 
    WHERE matches.id = messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
  OR 
  -- Policy for family members with supervision rights
  EXISTS (
    SELECT 1 FROM family_members fm
    JOIN matches m ON (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
    WHERE m.id = messages.match_id 
    AND fm.can_view_profile = true
    AND fm.user_id IN (
      SELECT user_id FROM family_members WHERE id = fm.id
    )
  )
);

-- Create function to automatically add family supervisors to conversations
CREATE OR REPLACE FUNCTION add_family_supervisors_to_conversation()
RETURNS TRIGGER AS $$
DECLARE
  match_record RECORD;
  family_member_record RECORD;
BEGIN
  -- Get the match details
  SELECT * INTO match_record FROM matches WHERE id = NEW.match_id;
  
  -- Add family supervisors from both users if family involvement is enabled
  FOR family_member_record IN 
    SELECT fm.* FROM family_members fm
    JOIN privacy_settings ps ON ps.user_id = fm.user_id
    WHERE fm.user_id IN (match_record.user1_id, match_record.user2_id)
    AND ps.allow_family_involvement = true
    AND (fm.can_communicate = true OR fm.is_wali = true)
  LOOP
    -- Add family member as conversation participant
    INSERT INTO conversation_participants (
      match_id, 
      participant_id, 
      participant_type, 
      family_member_id, 
      user_id,
      can_send_messages,
      can_read_messages
    ) VALUES (
      NEW.match_id,
      family_member_record.id,
      'family_member',
      family_member_record.id,
      family_member_record.user_id,
      family_member_record.can_communicate,
      true
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add family supervisors when a new message starts a conversation
CREATE TRIGGER add_family_supervisors_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION add_family_supervisors_to_conversation();

-- Create function to notify family members of new conversations
CREATE OR REPLACE FUNCTION notify_family_of_new_conversation()
RETURNS TRIGGER AS $$
DECLARE
  family_member_record RECORD;
  match_record RECORD;
  other_user_record RECORD;
BEGIN
  -- Get match details
  SELECT * INTO match_record FROM matches WHERE id = NEW.match_id;
  
  -- Get the other user in the conversation
  SELECT p.* INTO other_user_record 
  FROM profiles p 
  WHERE p.user_id = (
    CASE 
      WHEN match_record.user1_id = NEW.sender_id THEN match_record.user2_id
      ELSE match_record.user1_id
    END
  );
  
  -- Notify family members who have supervision enabled
  FOR family_member_record IN 
    SELECT fm.* FROM family_members fm
    JOIN privacy_settings ps ON ps.user_id = fm.user_id
    WHERE fm.user_id = NEW.sender_id
    AND ps.allow_family_involvement = true
    AND (fm.can_communicate = true OR fm.is_wali = true)
  LOOP
    -- Create notification for family member
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      related_match_id,
      related_user_id
    ) VALUES (
      family_member_record.user_id,
      'family_conversation_started',
      'Nouvelle conversation supervisée',
      format('Une conversation a commencé avec %s. En tant que %s, vous pouvez participer à cette conversation.',
        COALESCE(other_user_record.full_name, 'un utilisateur'),
        family_member_record.relationship
      ),
      NEW.match_id,
      CASE 
        WHEN match_record.user1_id = NEW.sender_id THEN match_record.user2_id
        ELSE match_record.user1_id
      END
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify family when conversations start
CREATE TRIGGER notify_family_conversation_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (OLD.* IS NULL) -- Only for the first message in a conversation
  EXECUTE FUNCTION notify_family_of_new_conversation();