
import { Card } from "@/components/ui/card";
import CustomButton from "../CustomButton";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Users, Heart, BookOpen } from "lucide-react";

interface ResultsDisplayProps {
  score: number;
  onRetake: () => void;
}

const ResultsDisplay = ({ score, onRetake }: ResultsDisplayProps) => {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return {
      title: "Excellent niveau de compatibilité",
      description: "Masha'Allah ! Vous avez d'excellentes bases pour un mariage béni selon les principes islamiques.",
      advice: "Continuez à cultiver ces valeurs communes et cherchez la bénédiction d'Allah dans votre union."
    };
    if (score >= 80) return {
      title: "Très bonne compatibilité",
      description: "Alhamdulillah ! Vous partagez des valeurs islamiques solides avec quelques points à approfondir.",
      advice: "Discutez ouvertement des quelques différences pour renforcer votre compréhension mutuelle."
    };
    if (score >= 70) return {
      title: "Compatibilité acceptable",
      description: "Vous avez des bases communes, mais un dialogue approfondi est recommandé.",
      advice: "Prenez le temps d'échanger sur vos différences et cherchez des conseils auprès de personnes sages."
    };
    if (score >= 60) return {
      title: "Compatibilité moyenne",
      description: "Il existe des différences importantes qui nécessitent une réflexion sérieuse.",
      advice: "Une médiation avec un imam ou un conseiller matrimonial pourrait être bénéfique."
    };
    return {
      title: "Différences importantes",
      description: "Les divergences sont significatives et nécessitent une réflexion approfondie.",
      advice: "Consultez des guides spirituels et prenez le temps nécessaire avant de prendre une décision."
    };
  };

  const result = getScoreMessage(score);

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Test de Compatibilité Matrimoniale Terminé !
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Votre profil de compatibilité selon les principes islamiques a été créé avec succès
        </p>
      </div>

      <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-rose-200 dark:border-rose-700">
        <div className="text-4xl font-bold mb-2">
          <span className={getScoreColor(score)}>{score}%</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {result.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          {result.description}
        </p>
        <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-rose-400">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            <strong>Conseil :</strong> {result.advice}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800 dark:text-blue-200">
            Prêt(e) à trouver votre moitié ?
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
          Explorez maintenant des profils avec des pourcentages de compatibilité basés sur vos valeurs islamiques partagées.
        </p>
        <div className="flex gap-3 justify-center">
          <CustomButton
            onClick={() => navigate("/nearby")}
            variant="default"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Users className="h-4 w-4" />
            Explorer les Profils
          </CustomButton>
          <CustomButton
            onClick={() => navigate("/profile")}
            variant="outline"
          >
            Retour au Profil
          </CustomButton>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-emerald-800 dark:text-emerald-200">
            Rappel Spirituel
          </span>
        </div>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 italic">
          "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté." - Coran 30:21
        </p>
      </div>

      <div className="border-t pt-4">
        <CustomButton
          onClick={onRetake}
          variant="outline"
          className="text-sm"
        >
          Refaire le Test
        </CustomButton>
      </div>
    </div>
  );
};

export default ResultsDisplay;
