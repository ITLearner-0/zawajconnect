
import { dummyProfiles } from '@/data/dummyData';
import { Toaster } from '@/components/ui/toaster';
import ProfileList from '@/components/demo/ProfileList';
import FeaturesAndSettings from '@/components/demo/FeaturesAndSettings';
import MessagingInterface from '@/components/demo/MessagingInterface';
import DemoHeader from '@/components/demo/DemoHeader';
import { useMessagingDemo } from '@/hooks/useMessagingDemo';
import { DatabaseProfile } from '@/types/profile';
import { useNavigate } from 'react-router-dom';

const Demo = () => {
  const navigate = useNavigate();
  const {
    currentUserId,
    selectedConversationId,
    conversations,
    currentConversation,
    messages,
    loading,
    messageInput,
    setMessageInput,
    sendingMessage,
    videoCallStatus,
    encryptionEnabled,
    monitoringEnabled,
    retentionPolicy,
    selectConversation,
    sendMessage,
    startVideoCall,
    endVideoCall,
    toggleEncryption,
    setMonitoringEnabled,
    updateRetentionPolicy
  } = useMessagingDemo();
  
  // Handle selecting a profile from the list
  const handleSelectProfile = (profile: DatabaseProfile) => {
    // Option 1: Navigate to profile page
    navigate(`/profile/${profile.id}`);
    
    // Option 2: Find if a conversation exists with this profile
    // and open the conversation (this functionality is maintained as before)
    const existingConversation = conversations.find(c => 
      c.participants.includes(profile.id)
    );
    
    if (existingConversation) {
      selectConversation(existingConversation);
    } else {
      // Create a new conversation with this profile
      const newConversation = {
        id: `conv-${Date.now()}`,
        created_at: new Date().toISOString(),
        participants: [currentUserId, profile.id],
        wali_supervised: profile.gender === 'Female',
        profile: {
          first_name: profile.first_name,
          last_name: profile.last_name
        }
      };
      
      // In a real app, you'd make an API call here
      // For the demo, we can update the local state
      selectConversation(newConversation);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
      <div className="container mx-auto py-6">
        <DemoHeader />
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ProfileList 
            profiles={dummyProfiles} 
            onSelectProfile={handleSelectProfile}
          />
          
          <FeaturesAndSettings 
            encryptionEnabled={encryptionEnabled}
            monitoringEnabled={monitoringEnabled}
            retentionPolicy={retentionPolicy}
          />
        </div>
        
        <MessagingInterface
          loading={loading}
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          currentConversation={currentConversation}
          selectConversation={selectConversation}
          currentUserId={currentUserId}
          messages={messages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          sendMessage={sendMessage}
          sendingMessage={sendingMessage}
          videoCallStatus={videoCallStatus}
          endVideoCall={endVideoCall}
          startVideoCall={startVideoCall}
          monitoringEnabled={monitoringEnabled}
          toggleMonitoring={() => setMonitoringEnabled(!monitoringEnabled)}
          encryptionEnabled={encryptionEnabled}
          toggleEncryption={toggleEncryption}
          retentionPolicy={retentionPolicy}
          updateRetentionPolicy={updateRetentionPolicy}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default Demo;
