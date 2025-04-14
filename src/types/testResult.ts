
// Shared TestResult type to be used across components
export type TestResult = {
  index: number;
  status: 'success' | 'error' | 'processing' | 'waiting';
  input?: string;
  expected?: string;
  output?: string;
  message?: string;
  points?: number;
  visible?: boolean;
  mcq?: boolean;
  questionTitle?: string;
};
