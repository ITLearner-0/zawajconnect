
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InfoCircle } from 'lucide-react';

const DemoHeader = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          Demo: Messaging and Video Chat
          <InfoCircle className="h-5 w-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This page demonstrates the messaging and video chat capabilities of the app using dummy profiles.
          You can select different conversations, send messages, and simulate video calls.
        </p>
        <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Click on a profile to start a conversation</li>
          <li>Send messages with the chat input at the bottom</li>
          <li>Try video calling using the video call button</li>
          <li>Experiment with different privacy and security settings</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default DemoHeader;
