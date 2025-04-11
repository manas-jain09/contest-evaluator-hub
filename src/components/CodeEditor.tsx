
import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CodeEditorProps {
  initialCode: string;
  onRun: (code: string, languageId: number) => void;
  onSubmit: (code: string, languageId: number) => void;
  isProcessing: boolean;
  languageTemplates: Record<number, string>;
  questionId: number; // Add questionId prop
  onLanguageChange?: (languageId: number) => void; // Add callback for language changes
  onCodeChange?: (code: string) => void; // Add callback for code changes
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode, 
  onRun, 
  onSubmit,
  isProcessing,
  languageTemplates,
  questionId,
  onLanguageChange,
  onCodeChange
}) => {
  const [code, setCode] = useState(initialCode);
  const [languageId, setLanguageId] = useState<number>(54); // Default to C++ (54)
  
  useEffect(() => {
    if (languageTemplates[languageId]) {
      setCode(languageTemplates[languageId]);
    }
  }, [languageId, languageTemplates]);
  
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode, questionId]);
  
  const handleLanguageChange = (value: string) => {
    const newLanguageId = Number(value);
    setLanguageId(newLanguageId);
    if (onLanguageChange) {
      onLanguageChange(newLanguageId);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };
  
  const handleRun = () => {
    if (!code.trim()) {
      toast.error("Please write some code before running");
      return;
    }
    onRun(code, languageId);
  };
  
  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }
    onSubmit(code, languageId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key to insert spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      // Insert 2 spaces at cursor position
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      
      // Move cursor position after inserted spaces
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);

      if (onCodeChange) {
        onCodeChange(newCode);
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">Code Editor</div>
        <div className="flex space-x-2">
          <Select 
            value={languageId.toString()} 
            onValueChange={handleLanguageChange}
            disabled={isProcessing}
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">C</SelectItem>
              <SelectItem value="54">C++</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isProcessing}
            className="bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="bg-contest-red text-white hover:bg-contest-red/90"
          >
            Submit
          </Button>
        </div>
      </div>
      
      <div className="relative flex-grow border rounded-md overflow-hidden bg-gray-50">
        <textarea
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          className="font-mono text-sm absolute inset-0 w-full h-full p-4 resize-none outline-none focus:ring-1 focus:ring-primary/20 bg-gray-50"
          placeholder="Write your solution here..."
          disabled={isProcessing}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
