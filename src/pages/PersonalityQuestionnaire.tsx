import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PersonalityQuestionnaireForm from '@/components/personality/PersonalityQuestionnaireForm';

const PersonalityQuestionnaire = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PersonalityQuestionnaireForm />
    </div>
  );
};

export default PersonalityQuestionnaire;
