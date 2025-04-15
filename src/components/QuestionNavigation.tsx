
import React from 'react';
import { CheckCircle, FileCode, FileText, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Separator } from "@/components/ui/separator";

interface Question {
  id: string;
  title: string;
  questionType: 'mcq' | 'coding';
  isSubmitted?: boolean;
}

interface QuestionNavigationProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  isCollapsedOnMobile?: boolean;
}

const QuestionNavigation = ({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  isCollapsedOnMobile = true
}: QuestionNavigationProps) => {
  const [isOpen, setIsOpen] = React.useState(!isCollapsedOnMobile);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-r border-gray-200"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-4 w-4 mr-2" />
            <span className="font-medium">Questions</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="p-0">
        <div className="p-2">
          <div className="text-xs text-muted-foreground mb-2 px-3 py-1">
            Navigate between questions
          </div>
          
          <div className="space-y-1">
            {questions.map((question, index) => (
              <Button
                key={question.id}
                variant={index === currentQuestionIndex ? "secondary" : "ghost"}
                className={`w-full justify-start text-sm h-auto py-2 ${
                  index === currentQuestionIndex ? "bg-gray-100" : ""
                }`}
                onClick={() => onSelectQuestion(index)}
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="flex-shrink-0">
                    {question.questionType === 'mcq' ? (
                      <FileText className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <FileCode className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-grow truncate text-left">
                    <span className="truncate">
                      {index + 1}. {question.title}
                    </span>
                  </div>
                  {question.isSubmitted && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default QuestionNavigation;
