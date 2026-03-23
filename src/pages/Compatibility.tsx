import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import CompatibilityTest from '@/components/CompatibilityTest';

const Compatibility = () => {
  return (
    <AccessibilityProvider>
      <TooltipProvider>
        <div
          className="min-h-screen py-12"
          style={{ backgroundColor: 'var(--color-bg-page)' }}
          role="main"
          aria-labelledby="compatibility-heading"
        >
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1
                id="compatibility-heading"
                className="text-3xl font-bold mb-4"
                style={{ color: 'var(--color-primary)' }}
              >
                Test de Compatibilité Matrimoniale selon le Coran et la Sunna
              </h1>
              <div className="max-w-2xl mx-auto space-y-4">
                <p className="italic text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous
                  viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la
                  bonté." - Coran 30:21
                </p>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Répondez honnêtement à chaque question pour évaluer votre compatibilité avec de
                  futurs partenaires selon les valeurs islamiques. Ce test vous aidera à trouver des
                  personnes qui partagent vos principes religieux et vos objectifs de vie.
                </p>
              </div>
            </div>

            <CompatibilityTest />

            <div className="mt-8 text-center">
              <div className="p-4 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Important :</strong> Aucun couple n'est parfait. L'important est la
                  volonté commune de s'améliorer et de plaire à Allah dans votre mariage. N'hésitez
                  pas à chercher des conseils auprès d'imams ou de sages pour approfondir votre
                  réflexion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AccessibilityProvider>
  );
};

export default Compatibility;
