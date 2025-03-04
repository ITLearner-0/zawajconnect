
import { dummyProfiles } from '@/data/dummyData';
import { Toaster } from '@/components/ui/toaster';
import ProfileList from '@/components/demo/ProfileList';
import FeaturesAndSettings from '@/components/demo/FeaturesAndSettings';
import MessagingInterface from '@/components/demo/MessagingInterface';
import DemoHeader from '@/components/demo/DemoHeader';
import { useMessagingDemo } from '@/hooks/useMessagingDemo';

const Demo = () => {
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
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <DemoHeader />
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ProfileList profiles={dummyProfiles} />
          
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
