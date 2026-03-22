import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon } from 'lucide-react';
import { ProfileFormData } from '@/types/profile';

interface IslamicProfileCardProps {
  formData: ProfileFormData;
  hijabPreference?: string;
  beardPreference?: string;
}

const LABELS: Record<string, Record<string, string>> = {
  religiousLevel: {
    'very-practicing': 'Très pratiquante',
    practicing: 'Pratiquante',
    'moderately-practicing': 'Modérément pratiquante',
    learning: 'En apprentissage',
    tres_pratiquant: 'Très pratiquant(e)',
    pratiquant: 'Pratiquant(e)',
    modere: 'Modéré(e)',
    peu_pratiquant: 'Peu pratiquant(e)',
    en_apprentissage: 'En apprentissage',
  },
  prayerFrequency: {
    'five-daily': '5 prières / jour',
    regular: 'Régulier',
    sometimes: 'Parfois',
    learning: 'En apprentissage',
    '5_fois': '5 prières / jour',
    irregulier: 'Irrégulier',
    vendredi: 'Vendredi seulement',
    occasions: 'Occasions spéciales',
    rarement: 'Rarement',
  },
  madhab: {
    hanafi: 'Hanafi',
    maliki: 'Maliki',
    shafii: "Shafi'i",
    hanbali: 'Hanbali',
    jafari: "Ja'fari",
    autre: 'Autre',
  },
};

const getLabel = (category: string, value: string | undefined): string => {
  if (!value) return '—';
  return LABELS[category]?.[value] || value;
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-sm">{value}</p>
  </div>
);

const IslamicProfileCard = ({ formData, hijabPreference, beardPreference }: IslamicProfileCardProps) => {
  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Profil islamique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoField label="Pratique religieuse" value={getLabel('religiousLevel', formData.religiousLevel)} />
          <InfoField label="Prière quotidienne" value={getLabel('prayerFrequency', formData.prayerFrequency)} />
          {hijabPreference && (
            <InfoField label="Port du voile" value={hijabPreference} />
          )}
          {beardPreference && (
            <InfoField label="Barbe" value={beardPreference} />
          )}
          <InfoField label="Madhab" value={getLabel('madhab', formData.madhab)} />
          <InfoField label="Langue maternelle" value={formData.motherTongue || '—'} />
          <InfoField label="Nationalité" value={formData.nationality || '—'} />
        </div>
      </CardContent>
    </Card>
  );
};

export default IslamicProfileCard;
