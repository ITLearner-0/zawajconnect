import { Question } from '@/data/compatibilityQuestions';
import { Answer } from '@/types/compatibility';
import MobileOptimizedQuestion from '../MobileOptimizedQuestion';

interface TestQuestionProps {
  question: Question;
  answer?: Answer;
  isDealbreaker: boolean;
  breakerThreshold: number;
  onAnswerChange: (value: number[]) => void;
  onDealbreakerChange: (value: boolean) => void;
  onThresholdChange: (value: number[]) => void;
  onWeightChange?: (value: number[]) => void;
}

const TestQuestion = (props: TestQuestionProps) => {
  return <MobileOptimizedQuestion {...props} />;
};

export default TestQuestion;
