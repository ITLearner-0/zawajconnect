
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import CompatibilityTest from "@/components/CompatibilityTest";

const Compatibility = () => {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-12" role="main" aria-labelledby="compatibility-heading">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 id="compatibility-heading" className="text-3xl font-bold text-rose-800 dark:text-rose-200 mb-4">
              Test de Compatibilité Matrimoniale selon le Coran et la Sunna
            </h1>
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-rose-600 dark:text-rose-300 italic text-lg">
                "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté." - Coran 30:21
              </p>
              <p className="text-rose-700 dark:text-rose-300">
                Répondez honnêtement à chaque question pour évaluer votre compatibilité avec de futurs partenaires selon les valeurs islamiques. 
                Ce test vous aidera à trouver des personnes qui partagent vos principes religieux et vos objectifs de vie.
              </p>
            </div>
          </div>
          
          <CompatibilityTest />
          
          <div className="mt-8 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700 max-w-2xl mx-auto">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                <strong>Important :</strong> Aucun couple n'est parfait. L'important est la volonté commune de s'améliorer et de plaire à Allah dans votre mariage. 
                N'hésitez pas à chercher des conseils auprès d'imams ou de sages pour approfondir votre réflexion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default Compatibility;
