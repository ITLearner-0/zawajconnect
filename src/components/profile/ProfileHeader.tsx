
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate('/demo')} 
      variant="ghost" 
      className="mb-4 hover:bg-islamic-teal/10"
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profiles
    </Button>
  );
};

export default ProfileHeader;
