
import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface CodeEditorProps {
  initialCode: string;
  onRun: (code: string) => void;
  onSubmit: (code: string) => void;
  isProcessing: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode, 
  onRun, 
  onSubmit,
  isProcessing 
}) => {
  const [code, setCode] = useState(initialCode);
  
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);
  
  const handleRun = () => {
    if (!code.trim()) {
      toast.error("Please write some code before running");
      return;
    }
    onRun(code);
  };
  
  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }
    onSubmit(code);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">Code Editor</div>
        <div className="flex space-x-2">
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
            className="bg-contest-blue text-white hover:bg-contest-blue/90"
          >
            Submit
          </Button>
        </div>
      </div>
      
      <div className="relative flex-grow border rounded-md overflow-hidden bg-gray-50">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono text-sm absolute inset-0 w-full h-full p-4 resize-none outline-none focus:ring-1 focus:ring-primary/20 bg-gray-50"
          placeholder="Write your solution here..."
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
