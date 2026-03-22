import { ProfileFormData } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  BookOpen,
  Heart,
  Camera,
  Shield,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface OnboardingSummaryProps {
  formData: ProfileFormData;
}

const SummaryRow = ({
  icon: Icon,
  label,
  value,
  missing,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  missing?: boolean;
}) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${missing ? 'text-amber-500' : 'text-emerald-600'}`} />
    <div className="flex-1 min-w-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      {value ? (
        <p className="text-sm font-medium truncate">{value}</p>
      ) : (
        <p className="text-sm text-amber-600 italic">Non renseigné</p>
      )}
    </div>
  </div>
);

const genderLabels: Record<string, string> = {
  male: 'Homme',
  female: 'Femme',
};

const religiousLevelLabels: Record<string, string> = {
  practicing: 'Pratiquant(e)',
  'very-practicing': 'Très pratiquant(e)',
  moderate: 'Modéré(e)',
  learning: 'En apprentissage',
  cultural: 'Culturel',
};

const OnboardingSummary = ({ formData }: OnboardingSummaryProps) => {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const filledCount = [
    formData.fullName,
    formData.gender,
    formData.location,
    formData.education,
    formData.occupation,
    formData.religiousLevel,
    formData.aboutMe,
    formData.profilePicture,
  ].filter(Boolean).length;

  const totalFields = 8;
  const completionPercent = Math.round((filledCount / totalFields) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Récapitulatif de votre profil</h2>
        <p className="text-muted-foreground">
          Vérifiez vos informations avant de terminer
        </p>
      </div>

      {/* Completion badge */}
      <div className="flex justify-center">
        <Badge
          className={`text-sm px-4 py-1 ${
            completionPercent >= 80
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}
          variant="outline"
        >
          {completionPercent >= 80 ? (
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          )}
          Profil complété à {completionPercent}%
        </Badge>
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3">
        <Avatar className="w-20 h-20 border-2 border-white shadow-md">
          <AvatarImage src={formData.profilePicture} />
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xl font-semibold">
            {formData.fullName ? getInitials(formData.fullName) : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="font-semibold text-lg">{formData.fullName || 'Nom non renseigné'}</h3>
          {formData.gender && (
            <span className="text-sm text-muted-foreground">
              {genderLabels[formData.gender] || formData.gender}
            </span>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 border rounded-lg p-4 bg-muted/30">
        <SummaryRow icon={MapPin} label="Localisation" value={formData.location} missing={!formData.location} />
        <SummaryRow icon={GraduationCap} label="Éducation" value={formData.education} missing={!formData.education} />
        <SummaryRow icon={Briefcase} label="Profession" value={formData.occupation} missing={!formData.occupation} />
        <SummaryRow
          icon={BookOpen}
          label="Pratique religieuse"
          value={religiousLevelLabels[formData.religiousLevel] || formData.religiousLevel}
          missing={!formData.religiousLevel}
        />
        <SummaryRow icon={Camera} label="Photo" value={formData.profilePicture ? 'Ajoutée' : undefined} missing={!formData.profilePicture} />
        {formData.gender === 'female' && (
          <SummaryRow icon={Shield} label="Wali" value={formData.waliName || undefined} missing={!formData.waliName} />
        )}
      </div>

      {/* About Me preview */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4 text-emerald-600" />
          <span className="text-xs text-muted-foreground">À propos de moi</span>
        </div>
        {formData.aboutMe ? (
          <p className="text-sm leading-relaxed line-clamp-4">{formData.aboutMe}</p>
        ) : (
          <p className="text-sm text-amber-600 italic">Non renseigné</p>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Vous pourrez modifier ces informations à tout moment depuis votre profil.
      </p>
    </div>
  );
};

export default OnboardingSummary;
