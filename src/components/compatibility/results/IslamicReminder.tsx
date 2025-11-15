import { BookOpen } from 'lucide-react';

const IslamicReminder = () => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
      <div className="flex items-center justify-center gap-2 mb-2">
        <BookOpen className="h-5 w-5 text-emerald-600" />
        <span className="font-medium text-emerald-800 dark:text-emerald-200">Rappel Spirituel</span>
      </div>
      <p className="text-sm text-emerald-700 dark:text-emerald-300 italic">
        "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en
        tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté." - Coran 30:21
      </p>
    </div>
  );
};

export default IslamicReminder;
