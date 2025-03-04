
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';

const EmptyConversation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center flex-grow text-gray-500">
      <div className="text-center">
        <p className="mb-4">Select a conversation or start a new one</p>
        <CustomButton 
          onClick={() => navigate('/nearby')} 
          variant="outline"
        >
          Find People Nearby
        </CustomButton>
      </div>
    </div>
  );
};

export default EmptyConversation;
