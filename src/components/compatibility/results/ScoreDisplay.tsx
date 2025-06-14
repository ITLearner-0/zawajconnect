
import { CheckCircle, Users, Heart, BookOpen, TrendingUp, AlertCircle } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay = ({ score }: ScoreDisplayProps) => {
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
      advice: "Continuez à cultiver ces valeurs communes et cherchez la bénédiction d'Allah dans votre union.",
      icon: <CheckCircle className="h-16 w-16 text-green-500" />
    };
    if (score >= 80) return {
      title: "Très bonne compatibilité",
      description: "Alhamdulillah ! Vous partagez des valeurs islamiques solides avec quelques points à approfondir.",
      advice: "Discutez ouvertement des quelques différences pour renforcer votre compréhension mutuelle.",
      icon: <Heart className="h-16 w-16 text-green-400" />
    };
    if (score >= 70) return {
      title: "Compatibilité acceptable",
      description: "Vous avez des bases communes, mais un dialogue approfondi est recommandé.",
      advice: "Prenez le temps d'échanger sur vos différences et cherchez des conseils auprès de personnes sages.",
      icon: <TrendingUp className="h-16 w-16 text-yellow-500" />
    };
    if (score >= 60) return {
      title: "Compatibilité moyenne",
      description: "Il existe des différences importantes qui nécessitent une réflexion sérieuse.",
      advice: "Une médiation avec un imam ou un conseiller matrimonial pourrait être bénéfique.",
      icon: <AlertCircle className="h-16 w-16 text-orange-500" />
    };
    return {
      title: "Différences importantes",
      description: "Les divergences sont significatives et nécessitent une réflexion approfondie.",
      advice: "Consultez des guides spirituels et prenez le temps nécessaire avant de prendre une décision.",
      icon: <AlertCircle className="h-16 w-16 text-red-500" />
    };
  };

  const result = getScoreMessage(score);

  return (
    <>
      <div className="flex justify-center">
        {result.icon}
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
    </>
  );
};

export default ScoreDisplay;
