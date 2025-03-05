
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info, Star, MessageCircle, Video } from 'lucide-react';
import { IslamicPattern } from '@/components/ui/islamic-pattern';

const DemoHeader = () => {
  return (
    <IslamicPattern variant="border" className="mb-6 bg-white">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-islamic-teal">
            <Star className="h-5 w-5 text-islamic-gold" />
            Nikah Connect Demo: Messaging and Video Chat
            <Info className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page demonstrates the messaging and video chat capabilities of Nikah Connect using dummy profiles.
            You can select different conversations, send messages, and simulate video calls.
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-islamic-teal/10 p-3 rounded-lg border border-islamic-teal/20">
              <div className="flex items-center text-islamic-teal mb-2">
                <MessageCircle className="h-4 w-4 mr-2" />
                <h3 className="font-medium">Messaging Features</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Click on a profile to start a conversation</li>
                <li>Send messages with the chat input at the bottom</li>
                <li>Test message encryption and retention policies</li>
              </ul>
            </div>
            
            <div className="bg-islamic-gold/10 p-3 rounded-lg border border-islamic-gold/20">
              <div className="flex items-center text-islamic-gold mb-2">
                <Video className="h-4 w-4 mr-2" />
                <h3 className="font-medium">Video Features</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Try video calling using the video call button</li>
                <li>Experiment with different privacy and security settings</li>
                <li>Experience Wali supervision for appropriate conversations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </IslamicPattern>
  );
};

export default DemoHeader;
