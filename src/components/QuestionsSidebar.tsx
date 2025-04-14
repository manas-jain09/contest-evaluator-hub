
import React from 'react';
import { FileCode, CheckCircle, CircleX, Circle, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Question } from '@/types/questions';

type QuestionsSidebarProps = {
  questions: Question[];
  currentQuestionIndex: number;
  submittedQuestions: Record<number, boolean>;
  mcqResults: Record<number, { isCorrect: boolean; selected: string; }>;
  onQuestionSelect: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
};

const QuestionsSidebar = ({ 
  questions, 
  currentQuestionIndex, 
  submittedQuestions, 
  mcqResults,
  onQuestionSelect, 
  isOpen,
  onToggle
}: QuestionsSidebarProps) => {
  return (
    <div className={`fixed top-16 bottom-0 left-0 transition-all duration-300 z-20 flex ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="bg-white border-r border-gray-100 w-64 h-full overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-medium">Questions</h2>
          <button onClick={onToggle} className="p-1 rounded-md hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 p-3 space-y-2">
          {questions.map((question, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isSubmitted = submittedQuestions[question.id] || mcqResults[question.id];
            let statusIcon;
            
            if (isSubmitted) {
              if (question.type === 'mcq') {
                statusIcon = mcqResults[question.id]?.isCorrect 
                  ? <CheckCircle className="h-4 w-4 text-contest-green" /> 
                  : <CircleX className="h-4 w-4 text-contest-red" />;
              } else {
                statusIcon = <CheckCircle className="h-4 w-4 text-contest-green" />;
              }
            } else {
              statusIcon = <Circle className="h-4 w-4 text-gray-300" />;
            }
            
            return (
              <div 
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={`p-2 rounded-md flex items-center space-x-2 cursor-pointer ${
                  isCurrent ? 'bg-contest-red/10 text-contest-red' : 'hover:bg-gray-50'
                }`}
              >
                {statusIcon}
                <span className="text-xs font-medium">{index + 1}.</span>
                {question.type === 'coding' 
                  ? <FileCode className="h-4 w-4" />
                  : <ListChecks className="h-4 w-4" />
                }
                <span className="text-sm truncate">{question.title}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <button 
        onClick={onToggle}
        className={`flex items-center justify-center h-10 w-6 bg-white border border-l-0 border-gray-100 rounded-r-md mt-20 ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open questions sidebar"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuestionsSidebar;
