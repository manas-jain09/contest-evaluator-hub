
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface McqOption {
  id: string;
  option_text: string;
  is_correct?: boolean;
}

interface McqQuestionProps {
  questionId: number;
  title: string;
  description: string;
  imageUrl?: string;
  onSubmit: (selectedOptionId: string, isCorrect: boolean) => void;
  isSubmitted?: boolean;
  prn?: string;
  contestId?: string;
}

const McqQuestion = ({ 
  questionId, 
  title, 
  description, 
  imageUrl, 
  onSubmit, 
  isSubmitted = false,
  prn,
  contestId
}: McqQuestionProps) => {
  const [options, setOptions] = useState<McqOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousSubmission, setPreviousSubmission] = useState<string | null>(null);

  // Load options and shuffle them
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mcq_options')
          .select('*')
          .eq('question_id', questionId);

        if (error) {
          throw error;
        }

        // Shuffle the options
        const shuffledOptions = [...(data || [])].sort(() => Math.random() - 0.5);
        setOptions(shuffledOptions);

        // Check if there's a previous submission
        if (prn && contestId) {
          const { data: submissionData } = await supabase
            .from('mcq_submissions')
            .select('selected_option_id')
            .eq('question_id', questionId)
            .eq('prn', prn)
            .single();
          
          if (submissionData) {
            setPreviousSubmission(submissionData.selected_option_id);
            setSelectedOption(submissionData.selected_option_id);
          }
        }
      } catch (error) {
        console.error('Error fetching MCQ options:', error);
        toast.error('Failed to load question options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [questionId, prn, contestId]);

  const handleSubmit = () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }
    
    // Find if the selected option is correct
    const selectedOptionDetails = options.find(option => option.id === selectedOption);
    const isCorrect = selectedOptionDetails?.is_correct || false;
    
    onSubmit(selectedOption, isCorrect);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-16 w-full" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-sm whitespace-pre-line mb-6">{description}</p>
        
        {imageUrl && (
          <div className="mb-6">
            <img 
              src={imageUrl} 
              alt={title} 
              className="max-w-full h-auto rounded-md border border-gray-200"
            />
          </div>
        )}
      </div>

      <div>
        <RadioGroup
          value={selectedOption || ''}
          onValueChange={setSelectedOption}
          className="space-y-4"
          disabled={isSubmitted || !!previousSubmission}
        >
          {options.map((option) => (
            <div 
              key={option.id} 
              className={`flex items-center space-x-2 p-4 rounded-md border ${
                previousSubmission === option.id && option.is_correct
                  ? 'border-green-200 bg-green-50'
                  : previousSubmission === option.id && !option.is_correct
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label 
                htmlFor={option.id} 
                className="flex-grow cursor-pointer"
              >
                {option.option_text}
              </Label>
              {previousSubmission === option.id && option.is_correct && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button 
        onClick={handleSubmit}
        className="mt-4"
        disabled={!selectedOption || isSubmitted || !!previousSubmission}
      >
        {previousSubmission ? 'Already Submitted' : 'Submit Answer'}
      </Button>
    </div>
  );
};

export default McqQuestion;
