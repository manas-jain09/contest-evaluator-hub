
export type QuestionType = 'coding' | 'mcq';

export interface BaseQuestion {
  id: number;
  title: string;
  description: string;
  type: QuestionType;
}

export interface CodingQuestion extends BaseQuestion {
  type: 'coding';
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: {
    input: string;
    expected: string;
    points: number;
    visible: boolean;
  }[];
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  imageUrl?: string;
  options: MCQOption[];
  points: number;
  // Add empty testCases to maintain type compatibility
  testCases?: never[];
}

export type Question = CodingQuestion | MCQQuestion;
