
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from 'lucide-react';

type TestResult = {
  index: number;
  status: 'success' | 'error';
  input?: string;
  expected?: string;
  output?: string;
  points?: number;
  visible?: boolean;
  mcq?: boolean;
  questionTitle?: string;
};

interface ResultsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  results: TestResult[];
  score: number;
  maxScore: number;
}

const ResultsDialog = ({ isOpen, setIsOpen, results, score, maxScore }: ResultsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Practice Results</DialogTitle>
          <DialogDescription>
            You scored {score} out of {maxScore} points
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <div className="flex-1 font-medium text-sm">Question</div>
            <div className="flex-1 font-medium text-sm">Status</div>
            <div className="w-20 text-right font-medium text-sm">Points</div>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {results.map((result) => (
              <div
                key={result.index}
                className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-sm">
                  {result.mcq ? (
                    <span>
                      {result.questionTitle || `MCQ Question ${result.index}`}
                    </span>
                  ) : (
                    <span>
                      {result.visible ? `Test case ${result.index}` : `Hidden test case ${result.index}`}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  {result.status === 'success' ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle size={16} className="mr-1" />
                      <span className="text-sm">Passed</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle size={16} className="mr-1" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                </div>
                <div className="w-20 text-right text-sm">
                  {result.status === 'success' ? (
                    <span className="font-medium text-green-600">{result.points}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-medium">Total Score</span>
            <span className="font-bold text-lg">{score} / {maxScore}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsDialog;
