
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const DemoHeader = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Demo: Messaging and Video Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This page demonstrates the messaging and video chat capabilities of the app using dummy profiles.
          You can select different conversations, send messages, and simulate video calls.
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoHeader;
