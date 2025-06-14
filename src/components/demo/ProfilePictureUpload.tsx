
import { DatabaseProfile } from '@/types/profile';
import LazyProfilePictureUpload from './LazyProfilePictureUpload';

interface ProfilePictureUploadProps {
  profile: DatabaseProfile;
  onPictureUpdate: (profileId: string, newImageUrl: string) => void;
}

const ProfilePictureUpload = ({ profile, onPictureUpdate }: ProfilePictureUploadProps) => {
  return <LazyProfilePictureUpload profile={profile} onPictureUpdate={onPictureUpdate} />;
};

export default ProfilePictureUpload;
