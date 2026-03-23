import { Moon } from 'lucide-react';
import { ProfileFormData } from '@/types/profile';

interface IslamicProfileCardProps {
  formData: Partial<ProfileFormData>;
  hijabPreference?: string;
  beardPreference?: string;
  lookingFor?: string;
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
    <p className="text-[10px] uppercase tracking-[0.05em]" style={{ color: 'var(--color-text-muted)' }}>
      {label}
    </p>
    <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
  </div>
);

const IslamicProfileCard = ({ formData, hijabPreference, beardPreference, lookingFor }: IslamicProfileCardProps) => {
  const resolvedLookingFor = lookingFor || (formData as any)?.lookingFor;

  return (
    <div
      className="rounded-2xl"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="p-4 pb-3">
        <h3
          className="text-base font-semibold flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <Moon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          Profil islamique
        </h3>
      </div>
      <div className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoField label="Pratique religieuse" value={getLabel('religiousLevel', formData.religiousLevel)} />
          <InfoField label="Prière quotidienne" value={getLabel('prayerFrequency', formData.prayerFrequency)} />
          {hijabPreference && <InfoField label="Port du voile" value={hijabPreference} />}
          {beardPreference && <InfoField label="Barbe" value={beardPreference} />}
          <InfoField label="Madhab" value={getLabel('madhab', formData.madhab)} />
          <InfoField label="Langues" value={formData.motherTongue || '—'} />
          <InfoField label="Origine" value={formData.nationality || '—'} />
        </div>

        {resolvedLookingFor && (
          <>
            <hr style={{ borderColor: 'var(--color-border-subtle)' }} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Ce que je recherche
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{resolvedLookingFor}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IslamicProfileCard;
