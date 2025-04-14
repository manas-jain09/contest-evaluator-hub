
import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toast';
import { MCQQuestion as MCQQuestionType } from '@/types/questions';

type MCQQuestionProps = {
  question: MCQQuestionType;
  onSubmit: (questionId: number, selectedOption: string, isCorrect: boolean, points: number) => void;
  isSubmitted: boolean;
  submittedOption?: string | null;
};

const MCQQuestion = ({ question, onSubmit, isSubmitted, submittedOption }: MCQQuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(submittedOption || null);
  const [shuffledOptions, setShuffledOptions] = useState<typeof question.options>([]);
  
  // Shuffle options when question changes or on first load
  useEffect(() => {
    const shuffled = [...question.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
  }, [question.id]);

  const handleOptionSelect = (optionId: string) => {
    if (!isSubmitted) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      toast.error("Please select an option before submitting");
      return;
    }
    
    const selected = question.options.find(opt => opt.id === selectedOption);
    if (selected) {
      onSubmit(question.id, selectedOption, selected.isCorrect, selected.isCorrect ? question.points : 0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Question</h3>
        <div className="text-sm whitespace-pre-line">
          {question.description}
        </div>
      </div>

      {question.imageUrl && (
        <div className="my-4">
          <img 
            src={question.imageUrl} 
            alt="Question illustration" 
            className="rounded-md border border-gray-200 max-h-80 mx-auto" 
          />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Options</h3>
        {shuffledOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.isCorrect && isSubmitted;
          const isIncorrect = isSelected && !option.isCorrect && isSubmitted;
          
          return (
            <div 
              key={option.id} 
              className={`p-3 rounded-md border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-contest-red bg-contest-red/5' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                isCorrect ? 'border-contest-green bg-contest-green/5' : ''
              } ${
                isIncorrect ? 'border-contest-red bg-contest-red/5' : ''
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="flex items-start">
                <div className={`w-4 h-4 mt-0.5 rounded-full border ${
                  isSelected ? 'border-contest-red bg-contest-red' : 'border-gray-300'
                } ${
                  isCorrect ? 'border-contest-green bg-contest-green' : ''
                }`}>
                  {isSelected && !isSubmitted && <div className="w-2 h-2 m-0.5 rounded-full bg-white"></div>}
                  {isCorrect && isSubmitted && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="ml-3 text-sm">{option.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <Button
          onClick={handleSubmit}
          className="w-full bg-contest-red hover:bg-contest-red/90"
          disabled={!selectedOption}
        >
          Submit Answer
        </Button>
      )}

      {isSubmitted && (
        <div className="bg-gray-50 rounded-md p-4 border border-gray-100 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Answer submitted</p>
            <p className="text-sm text-muted-foreground">
              {submittedOption && question.options.find(o => o.id === submittedOption)?.isCorrect
                ? "Correct answer! You've earned points for this question."
                : "Your answer was not correct. No points earned for this question."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQQuestion;
