
export interface Question {
  id: number;
  question: string;
  category: string;
  weight: number;
  isBreaker: boolean;
  description?: string;
}

export const questions: Question[] = [
  {
    id: 1,
    question: "How important is regular prayer in your daily life?",
    category: "Religious Practice",
    weight: 2.0,
    isBreaker: true,
    description: "This question helps match individuals with similar dedication to daily prayers."
  },
  {
    id: 2,
    question: "How significant is family involvement in your life decisions?",
    category: "Family Values",
    weight: 1.5,
    isBreaker: false,
    description: "This determines compatibility regarding family influence and involvement."
  },
  {
    id: 3,
    question: "How important is continuing Islamic education to you?",
    category: "Education",
    weight: 1.2,
    isBreaker: false,
    description: "This measures alignment on ongoing religious learning."
  },
  {
    id: 4,
    question: "How traditional are your views on marriage roles?",
    category: "Marriage Views",
    weight: 1.8,
    isBreaker: true,
    description: "This assesses compatibility on traditional versus modern marriage role expectations."
  },
  {
    id: 5,
    question: "How important is maintaining Islamic dietary restrictions?",
    category: "Lifestyle",
    weight: 1.5,
    isBreaker: true,
    description: "This determines alignment on halal dietary practices."
  },
  {
    id: 6,
    question: "How important is modest dressing to you?",
    category: "Lifestyle",
    weight: 1.5,
    isBreaker: false,
    description: "This measures compatibility regarding dress code preferences."
  },
  {
    id: 7,
    question: "How important is it that your spouse has similar cultural background?",
    category: "Cultural Values",
    weight: 1.0,
    isBreaker: false,
    description: "This identifies compatibility on cultural alignment preferences."
  },
  {
    id: 8,
    question: "How important is financial responsibility in marriage?",
    category: "Financial Values",
    weight: 1.3,
    isBreaker: false,
    description: "This helps match individuals with similar financial values and expectations."
  }
];

// Group questions by category for easier display
export const questionsByCategory = questions.reduce((acc, question) => {
  if (!acc[question.category]) {
    acc[question.category] = [];
  }
  acc[question.category].push(question);
  return acc;
}, {} as Record<string, Question[]>);

// Calculate max possible weighted score
export const calculateMaxPossibleScore = (): number => {
  let totalWeight = 0;
  
  for (const question of questions) {
    totalWeight += question.weight;
  }
  
  return totalWeight * 100; // 100 is max value for each question
};
