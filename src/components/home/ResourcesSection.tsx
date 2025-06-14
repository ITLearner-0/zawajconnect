
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import FeaturedResources from "@/components/resources/FeaturedResources";

const ResourcesSection = () => {
  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-200 font-serif">
            Ressources Mariage Islamique
          </h2>
          <p className="text-xl text-rose-600 dark:text-rose-300 max-w-3xl mx-auto">
            Explorez des ressources soigneusement sélectionnées pour vous aider à préparer un mariage islamique réussi.
          </p>
        </div>
        
        <FeaturedResources />
        
        <div className="text-center mt-16">
          <Button 
            asChild 
            variant="outline" 
            className="border-2 border-rose-400 text-rose-600 hover:bg-rose-100 dark:border-rose-400 dark:text-rose-300 dark:hover:bg-rose-900/30 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full"
            size="lg"
          >
            <Link to="/resources" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Voir Toutes les Ressources
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
