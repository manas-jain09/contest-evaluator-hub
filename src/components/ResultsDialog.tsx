
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';

type TestResult = {
  index: number;
  status: 'success' | 'error' | 'processing' | 'waiting';
  input?: string;
  expected?: string;
  output?: string;
  message?: string;
  points?: number;
  visible?: boolean;
};

interface ResultsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  results: TestResult[];
  score: number;
  maxScore: number;
}

const ResultsDialog: React.FC<ResultsDialogProps> = ({
  isOpen,
  setIsOpen,
  results,
  score,
  maxScore
}) => {
  const passedCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            Practice Results
          </DialogTitle>
          <DialogDescription>
            Your code has been evaluated against the test cases
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md border border-gray-100">
            <div>
              <h3 className="font-medium">Your Score</h3>
              <p className="text-3xl font-bold mt-1">
                {score} <span className="text-sm text-gray-500 font-normal">/ {maxScore}</span>
              </p>
            </div>
            
            <div className="text-right">
              <h3 className="font-medium">Test Cases</h3>
              <div className="flex items-center mt-1">
                <span className={`text-2xl font-bold ${passRate >= 70 ? 'text-green-600' : passRate >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                  {passRate}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  ({passedCount}/{totalCount} passed)
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Test Case Results</h3>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md border ${result.status === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">Test Case {result.index}</span>
                  </div>
                  {result.points !== undefined && (
                    <span className={`text-sm font-medium ${result.status === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                      {result.status === 'success' ? `+${result.points}` : '0'} points
                    </span>
                  )}
                </div>
                {result.status === 'error' && result.message && (
                  <p className="mt-1 text-sm text-red-600 ml-7">
                    {result.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)} className="bg-contest-red hover:bg-contest-red/90 text-white">
              Continue Practice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsDialog;
