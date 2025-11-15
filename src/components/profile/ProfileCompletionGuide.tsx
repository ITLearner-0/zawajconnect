import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { ProfileFormData, VerificationStatus } from '@/types/profile';

interface ProfileCompletionGuideProps {
  formData: ProfileFormData;
  verificationStatus: VerificationStatus;
}

const ProfileCompletionGuide: React.FC<ProfileCompletionGuideProps> = ({
  formData,
  verificationStatus,
}) => {
  const completionItems = [
    {
      key: 'basic_info',
      label: 'Informations de base',
      completed: !!(formData.fullName && formData.age && formData.gender && formData.location),
      description: 'Nom, âge, genre, localisation',
    },
    {
      key: 'religious_info',
      label: 'Informations religieuses',
      completed: !!(formData.religiousLevel && formData.prayerFrequency),
      description: 'Niveau de pratique, fréquence de prière',
    },
    {
      key: 'education_career',
      label: 'Éducation et carrière',
      completed: !!(formData.education && formData.occupation),
      description: "Niveau d'éducation, profession",
    },
    {
      key: 'about_me',
      label: 'À propos de moi',
      completed: !!(formData.aboutMe && formData.aboutMe.length >= 50),
      description: 'Description personnelle (min. 50 caractères)',
    },
    {
      key: 'wali_info',
      label: 'Informations du Wali',
      completed:
        formData.gender === 'male' ||
        !!(formData.waliName && formData.waliRelationship && formData.waliContact),
      description: 'Nom, relation, contact du wali (pour les femmes)',
    },
    {
      key: 'email_verification',
      label: 'Vérification email',
      completed: verificationStatus.email,
      description: 'Confirmer votre adresse email',
    },
    {
      key: 'phone_verification',
      label: 'Vérification téléphone',
      completed: verificationStatus.phone,
      description: 'Confirmer votre numéro de téléphone',
    },
    {
      key: 'id_verification',
      label: 'Vérification identité',
      completed: verificationStatus.id,
      description: 'Vérifier votre identité',
    },
  ];

  const completedCount = completionItems.filter((item) => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  const getCompletionLevel = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 70) return { label: 'Bon', color: 'bg-blue-500' };
    if (percentage >= 50) return { label: 'Moyen', color: 'bg-yellow-500' };
    return { label: 'À améliorer', color: 'bg-red-500' };
  };

  const level = getCompletionLevel(completionPercentage);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-rose-800">
            Complétude du Profil
          </CardTitle>
          <Badge className={`${level.color} text-white`}>{level.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-gray-600">
            {completedCount} sur {completionItems.length} éléments complétés
          </p>
        </div>

        {/* Completion Items */}
        <div className="space-y-3">
          {completionItems.map((item) => (
            <div key={item.key} className="flex items-start gap-3">
              {item.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${item.completed ? 'text-green-700' : 'text-gray-900'}`}
                >
                  {item.label}
                </div>
                <div className="text-xs text-gray-600">{item.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips for completion */}
        {completionPercentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">
              Conseil pour améliorer votre profil
            </h4>
            <p className="text-xs text-blue-700">
              Un profil complet augmente vos chances de trouver des matches compatibles de 300% !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionGuide;
