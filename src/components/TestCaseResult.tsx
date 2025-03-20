
import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'success' | 'error' | 'processing' | 'waiting';

interface TestCaseResultProps {
  index: number;
  status: Status;
  input?: string;
  expected?: string; 
  output?: string;
  message?: string;
  points?: number;
  visible?: boolean;
}

const TestCaseResult: React.FC<TestCaseResultProps> = ({
  index,
  status,
  input,
  expected,
  output,
  message,
  points,
  visible = true
}) => {
  const statusConfig = {
    success: {
      icon: <CheckCircle className="h-5 w-5 text-contest-green" />,
      text: 'Passed',
      textColor: 'text-contest-green',
      className: 'test-case-success'
    },
    error: {
      icon: <XCircle className="h-5 w-5 text-contest-red" />,
      text: 'Failed',
      textColor: 'text-contest-red',
      className: 'test-case-error'
    },
    processing: {
      icon: <Clock className="h-5 w-5 text-contest-blue animate-pulse" />,
      text: 'Processing',
      textColor: 'text-contest-blue',
      className: ''
    },
    waiting: {
      icon: <AlertCircle className="h-5 w-5 text-contest-gray" />,
      text: 'Waiting',
      textColor: 'text-contest-gray',
      className: ''
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={cn("test-case", config.className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {config.icon}
          <span className={cn("ml-2 font-medium", config.textColor)}>
            {visible ? `Test Case #${index}` : `Hidden Test Case #${index}`}
          </span>
        </div>
        
        {points && status === 'success' && (
          <div className="bg-contest-green/10 text-contest-green px-2 py-0.5 rounded text-xs font-medium">
            +{points} points
          </div>
        )}
      </div>
      
      {status !== 'waiting' && visible && (
        <div className="mt-3 space-y-2 text-sm">
          {input && (
            <div>
              <div className="font-medium text-xs uppercase text-gray-500 mb-1">Input:</div>
              <div className="font-mono bg-gray-100 p-2 rounded text-xs overflow-x-auto">{input}</div>
            </div>
          )}
          
          {expected && (
            <div>
              <div className="font-medium text-xs uppercase text-gray-500 mb-1">Expected:</div>
              <div className="font-mono bg-gray-100 p-2 rounded text-xs overflow-x-auto">{expected}</div>
            </div>
          )}
          
          {output && (
            <div>
              <div className="font-medium text-xs uppercase text-gray-500 mb-1">Output:</div>
              <div className="font-mono bg-gray-100 p-2 rounded text-xs overflow-x-auto">{output}</div>
            </div>
          )}
          
          {message && (
            <div>
              <div className="font-medium text-xs uppercase text-gray-500 mb-1">Message:</div>
              <div className="font-mono bg-gray-100 p-2 rounded text-xs text-contest-red overflow-x-auto">{message}</div>
            </div>
          )}
        </div>
      )}
      
      {!visible && (
        <div className="mt-2 text-sm text-gray-500">
          <p>This test case is hidden and will be evaluated upon final submission.</p>
        </div>
      )}
    </div>
  );
};

export default TestCaseResult;
