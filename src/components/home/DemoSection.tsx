
import { CardContent } from "@/components/ui/card";
import DemoLink from "@/components/demo/DemoLink";

const DemoSection = () => {
  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-rose-100/50 to-pink-100/50 dark:from-rose-900/30 dark:to-pink-900/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-rose-800 dark:text-rose-200 font-serif">
          Découvrez Notre Plateforme
        </h2>
        <p className="text-xl text-rose-600 dark:text-rose-300 mb-12 max-w-2xl mx-auto">
          Essayez nos fonctionnalités de messagerie et d'appel vidéo avec des profils de démonstration interactifs.
        </p>
        
        <div className="bg-white dark:bg-rose-900/50 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-700 max-w-2xl mx-auto">
          <CardContent className="p-12">
            <DemoLink className="mb-6" />
            <p className="text-rose-600 dark:text-rose-300">
              Explorez toutes les fonctionnalités en toute sécurité avec notre environnement de test.
            </p>
          </CardContent>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
