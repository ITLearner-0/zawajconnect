import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationStatus {
  email_verified: boolean;
  id_verified: boolean;
  verification_score: number;
  id_document_status?: string | null;
  submitted_at?: string | null;
  verification_documents?: string[];
  verification_notes?: string;
  verified_at?: string | null;
  verified_by?: string | null;
  phone_verified?: boolean;
  family_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  id?: string;
  user_id?: string;
}

export const IDVerificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading verification status:', error);
        return;
      }

      setStatus(data || {
        email_verified: false,
        id_verified: false,
        verification_score: 0,
        id_document_status: null,
        submitted_at: null
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(`verification/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Update verification status
      const { error: updateError } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: user.id,
          id_document_status: 'pending_review',
          submitted_at: new Date().toISOString(),
          verification_score: Math.max((status?.verification_score || 0), 20)
        });

      if (updateError) throw updateError;

      toast({
        title: "ID Document Uploaded",
        description: "Your ID document has been submitted for review. This may take 1-2 business days.",
      });

      loadVerificationStatus();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload ID document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getVerificationLevel = (score: number) => {
    if (score >= 80) return { level: 'Ultra Verified', color: 'bg-emerald-500', icon: Shield };
    if (score >= 60) return { level: 'Highly Verified', color: 'bg-blue-500', icon: CheckCircle };
    if (score >= 30) return { level: 'Basic Verified', color: 'bg-amber-500', icon: Clock };
    return { level: 'Unverified', color: 'bg-gray-500', icon: XCircle };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const verification = getVerificationLevel(status?.verification_score || 0);
  const VerificationIcon = verification.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            Verify your identity to access enhanced features and build trust with potential matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Current Verification Level</span>
            <Badge className={`${verification.color} text-white`}>
              <VerificationIcon className="w-4 h-4 mr-1" />
              {verification.level}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {status?.email_verified ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span>Email Verified</span>
            </div>
            <div className="flex items-center gap-2">
              {status?.id_verified ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span>ID Verified</span>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((status?.verification_score || 0), 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Verification Score: {status?.verification_score || 0}/100
          </p>
        </CardContent>
      </Card>

      {!status?.id_verified && (
        <Card>
          <CardHeader>
            <CardTitle>Upload ID Document</CardTitle>
            <CardDescription>
              Upload a clear photo of your government-issued ID to verify your identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.id_document_status === 'pending_review' && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your ID document is under review. We'll notify you once verification is complete.
                </AlertDescription>
              </Alert>
            )}

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
              <label htmlFor="id-upload">
                <Button 
                  variant="outline" 
                  disabled={uploading || status?.id_document_status === 'pending_review'}
                  asChild
                >
                  <span>
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </span>
                </Button>
              </label>
              <input
                id="id-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleIDUpload}
                className="hidden"
                disabled={uploading || status?.id_document_status === 'pending_review'}
              />
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your documents are encrypted and processed securely. We only use them for verification purposes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Verification Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={status?.verification_score >= 30 ? "default" : "outline"}>
                Score 30+
              </Badge>
              <span className="text-sm">Access compatibility questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={status?.verification_score >= 60 ? "default" : "outline"}>
                Score 60+
              </Badge>
              <span className="text-sm">Enhanced profile visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={status?.verification_score >= 80 ? "default" : "outline"}>
                Score 80+
              </Badge>
              <span className="text-sm">Priority matching and family supervision access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDVerificationSystem;