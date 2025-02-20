
export interface Question {
  id: number;
  question: string;
  category: string;
  weight: number;
  isBreaker: boolean;
}

export const questions: Question[] = [
  {
    id: 1,
    question: "How important is regular prayer in your daily life?",
    category: "Religious Practice",
    weight: 2.0,
    isBreaker: true,
  },
  {
    id: 2,
    question: "How significant is family involvement in your life decisions?",
    category: "Family Values",
    weight: 1.5,
    isBreaker: false,
  },
  {
    id: 3,
    question: "How important is continuing Islamic education to you?",
    category: "Education",
    weight: 1.2,
    isBreaker: false,
  },
  {
    id: 4,
    question: "How traditional are your views on marriage roles?",
    category: "Marriage Views",
    weight: 1.8,
    isBreaker: true,
  },
  {
    id: 5,
    question: "How important is maintaining Islamic dietary restrictions?",
    category: "Lifestyle",
    weight: 1.5,
    isBreaker: true,
  },
  {
    id: 6,
    question: "How important is modest dressing to you?",
    category: "Lifestyle",
    weight: 1.5,
    isBreaker: false,
  },
  {
    id: 7,
    question: "How important is it that your spouse has similar cultural background?",
    category: "Cultural Values",
    weight: 1.0,
    isBreaker: false,
  },
  {
    id: 8,
    question: "How important is financial responsibility in marriage?",
    category: "Financial Values",
    weight: 1.3,
    isBreaker: false,
  }
];
