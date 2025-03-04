
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatabaseProfile } from '@/types/profile';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  profile: DatabaseProfile;
  onPictureUpdate: (profileId: string, newImageUrl: string) => void;
}

const ProfilePictureUpload = ({ profile, onPictureUpdate }: ProfilePictureUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // For demo purposes, we'll just create a local URL
      // In a real app, you would upload to a server/Supabase storage
      const imageUrl = URL.createObjectURL(file);
      
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPictureUpdate(profile.id, imageUrl);
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="relative group">
      <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-islamic-teal/20 group-hover:opacity-80 transition-opacity">
        {profile.profile_picture ? (
          <AvatarImage src={profile.profile_picture} alt={`${profile.first_name}'s profile`} />
        ) : null}
        <AvatarFallback className="bg-islamic-teal text-white">{profile.first_name[0]}</AvatarFallback>
      </Avatar>
      
      <label
        htmlFor={`profile-upload-${profile.id}`}
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
        aria-label="Upload profile picture"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </label>
      
      <input
        type="file"
        id={`profile-upload-${profile.id}`}
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
};

export default ProfilePictureUpload;
