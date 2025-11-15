import { Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../CustomButton';

const ActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Heart className="h-5 w-5 text-blue-600" />
        <span className="font-medium text-blue-800 dark:text-blue-200">
          Prêt(e) à trouver votre moitié ?
        </span>
      </div>
      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
        Explorez maintenant des profils avec des pourcentages de compatibilité basés sur vos valeurs
        islamiques partagées.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <CustomButton
          onClick={() => navigate('/nearby')}
          variant="default"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Users className="h-4 w-4" />
          Explorer les Profils
        </CustomButton>
        <CustomButton onClick={() => navigate('/profile')} variant="outline">
          Retour au Profil
        </CustomButton>
      </div>
    </div>
  );
};

export default ActionButtons;
