
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import CodeEditor from '@/components/CodeEditor';
import TestCaseResult from '@/components/TestCaseResult';
import FullscreenAlert from '@/components/FullscreenAlert';
import { useFullscreen } from '@/hooks/useFullscreen';
import { questions, submitCode, getSubmissionResult } from '@/utils/contestUtils';

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

const Contest = () => {
  const navigate = useNavigate();
  const { isFullscreen, warningShown } = useFullscreen();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState<Record<number, string>>({});
  const [testResults, setTestResults] = useState<Record<number, TestResult[]>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Initialize user code with template code
  useEffect(() => {
    const initialCode: Record<number, string> = {};
    questions.forEach((q) => {
      initialCode[q.id] = q.templateCode;
    });
    setUserCode(initialCode);
  }, []);
  
  // Check if user is registered and contest has started
  useEffect(() => {
    const userData = sessionStorage.getItem('contestUser');
    const startTime = sessionStorage.getItem('contestStartTime');
    
    if (!userData) {
      toast.error("You must register before accessing the contest");
      navigate('/register');
      return;
    }
    
    if (!startTime) {
      toast.error("You must start the contest from the instructions page");
      navigate('/instructions');
      return;
    }
    
    // Set contest time (60 minutes)
    const contestStartTime = JSON.parse(startTime);
    const contestEndTime = contestStartTime + (60 * 60 * 1000); // 60 minutes in milliseconds
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = contestEndTime - now;
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        toast.error("Contest time is up!");
        // End contest automatically
        handleEndContest();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [navigate]);
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (questionId: number, code: string) => {
    setUserCode(prev => ({
      ...prev,
      [questionId]: code
    }));
  };
  
  const handleRun = async (code: string) => {
    setIsProcessing(true);
    
    // Reset test results for this question's visible test cases
    const initialResults: TestResult[] = currentQuestion.testCases
      .filter(tc => tc.visible)
      .map((tc, index) => ({
        index: index + 1,
        status: 'processing',
        input: JSON.stringify(tc.input),
        expected: JSON.stringify(tc.expected),
        visible: tc.visible,
        points: tc.points
      }));
    
    setTestResults(prev => ({
      ...prev,
      [currentQuestion.id]: initialResults
    }));
    
    // Simulate code execution for visible test cases
    try {
      // This is a mock implementation. In a real app, this would call the Judge0 API
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Process test cases one by one with a delay between each
      for (let i = 0; i < initialResults.length; i++) {
        await delay(1000 + Math.random() * 1000); // Random delay to simulate processing
        
        const testCase = currentQuestion.testCases.find(tc => tc.visible && tc.points === initialResults[i].points);
        if (!testCase) continue;
        
        // Mock running the code (in a real app, this would evaluate the user's code)
        let output, status, message;
        
        try {
          // Very simplistic evaluation - this is just a mock!
          // In a real app, you would use the Judge0 API
          const mockOutput = code.includes(`return [${testCase.expected.join(', ')}]`) || 
                             code.includes(`return ${testCase.expected}`);
          
          if (mockOutput) {
            status = 'success';
            output = JSON.stringify(testCase.expected);
          } else {
            status = 'error';
            output = '[1, 3]'; // Mock wrong output
            message = 'Output does not match expected result.';
          }
        } catch (error) {
          status = 'error';
          message = 'Runtime error occurred.';
        }
        
        // Update this specific test result
        setTestResults(prev => {
          const updatedResults = [...(prev[currentQuestion.id] || [])];
          updatedResults[i] = {
            ...updatedResults[i],
            status: status as 'success' | 'error',
            output,
            message
          };
          return {
            ...prev,
            [currentQuestion.id]: updatedResults
          };
        });
      }
    } catch (error) {
      toast.error("Error running code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSubmit = async (code: string) => {
    setIsProcessing(true);
    toast.info("Submitting your solution...");
    
    try {
      // This would use the actual Judge0 API in a real implementation
      // For now, we'll use a mock implementation similar to handleRun
      
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(2000); // Simulate submission delay
      
      // Mark this question as submitted
      setSubmittedQuestions(prev => ({
        ...prev,
        [currentQuestion.id]: true
      }));
      
      // Store code in sessionStorage for later use in summary
      const storedSubmissions = JSON.parse(sessionStorage.getItem('contestSubmissions') || '{}');
      sessionStorage.setItem('contestSubmissions', JSON.stringify({
        ...storedSubmissions,
        [currentQuestion.id]: {
          code,
          timestamp: Date.now()
        }
      }));
      
      toast.success("Solution submitted successfully!");
      
      // Navigate to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1000);
      }
    } catch (error) {
      toast.error("Error submitting solution. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handleEndContest = () => {
    // Calculate scores based on test results and submitted questions
    const results: Record<number, any> = {};
    let totalScore = 0;
    
    questions.forEach(question => {
      const isSubmitted = submittedQuestions[question.id];
      let questionScore = 0;
      
      // Simulate scoring (in a real app, you'd use actual test results)
      if (isSubmitted) {
        const testResults = question.testCases.map(tc => {
          // Very simplistic scoring - this would be based on actual test results in a real app
          const code = userCode[question.id] || '';
          const passes = code.includes(`return [${tc.expected.join(', ')}]`) || code.includes(`return ${tc.expected}`);
          return { passed: passes, points: tc.points };
        });
        
        questionScore = testResults.reduce((sum, tc) => sum + (tc.passed ? tc.points : 0), 0);
        totalScore += questionScore;
        
        results[question.id] = {
          submitted: true,
          score: questionScore,
          maxScore: question.testCases.reduce((sum, tc) => sum + tc.points, 0),
          testResults
        };
      } else {
        results[question.id] = {
          submitted: false,
          score: 0,
          maxScore: question.testCases.reduce((sum, tc) => sum + tc.points, 0)
        };
      }
    });
    
    // Store contest results
    sessionStorage.setItem('contestResults', JSON.stringify({
      totalScore,
      questions: results,
      completedAt: Date.now()
    }));
    
    // Navigate to summary page
    navigate('/summary');
  };
  
  if (timeLeft === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/10 border-t-primary animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading contest...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <FullscreenAlert isActive={!isFullscreen} />
      
      <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 z-10">
        <div className="text-lg font-semibold">Arena Contest</div>
        
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Time Remaining:</span>
            <div className={`font-mono text-sm font-medium rounded px-2 py-1 flex items-center ${timeLeft < 5 * 60 * 1000 ? 'bg-contest-red/10 text-contest-red' : 'bg-blue-50 text-contest-blue'}`}>
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <Button 
            onClick={handleEndContest}
            variant="outline" 
            size="sm"
            className="border-contest-red/20 text-contest-red hover:bg-contest-red/5 hover:text-contest-red"
          >
            End Contest
          </Button>
        </div>
      </header>
      
      <main className="flex-grow flex overflow-hidden">
        {/* Left panel - Question */}
        <div className="w-1/2 contest-panel-left">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="bg-contest-blue/10 text-contest-blue text-xs font-medium px-2 py-1 rounded mr-2">
                Question {currentQuestionIndex + 1}/{questions.length}
              </span>
              {submittedQuestions[currentQuestion.id] && (
                <span className="flex items-center text-xs text-contest-green bg-contest-green/10 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Submitted
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-white"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="bg-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{currentQuestion.title}</h1>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <div className="text-sm whitespace-pre-line">
                {currentQuestion.description}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Examples</h3>
              <div className="space-y-4">
                {currentQuestion.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-4 border border-gray-100">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500">Input:</span>
                      <pre className="mt-1 text-sm font-mono bg-white p-2 rounded border border-gray-100">
                        {example.input}
                      </pre>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500">Output:</span>
                      <pre className="mt-1 text-sm font-mono bg-white p-2 rounded border border-gray-100">
                        {example.output}
                      </pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Explanation:</span>
                        <p className="mt-1 text-sm">
                          {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Constraints</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {currentQuestion.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right panel - Code Editor */}
        <div className="w-1/2 contest-panel-right">
          <CodeEditor 
            initialCode={userCode[currentQuestion.id] || currentQuestion.templateCode}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Test Results</h3>
            
            {isProcessing && (
              <div className="bg-blue-50 rounded-md p-4 flex items-center text-contest-blue mb-3">
                <div className="h-4 w-4 rounded-full border-2 border-contest-blue/30 border-t-contest-blue animate-spin mr-3"></div>
                <p className="text-sm">Evaluating your solution...</p>
              </div>
            )}
            
            <div className="space-y-3">
              {!testResults[currentQuestion.id] || testResults[currentQuestion.id].length === 0 ? (
                <div className="bg-gray-50 rounded-md p-6 border border-gray-100 text-center">
                  <p className="text-muted-foreground text-sm">
                    Run your code to see test results
                  </p>
                </div>
              ) : (
                testResults[currentQuestion.id].map((result, index) => (
                  <TestCaseResult
                    key={index}
                    index={index + 1}
                    status={result.status}
                    input={result.input}
                    expected={result.expected}
                    output={result.output}
                    message={result.message}
                    points={result.points}
                    visible={result.visible}
                  />
                ))
              )}
            </div>
            
            {currentQuestion.testCases.some(tc => !tc.visible) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-100">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Note:</span> There are {currentQuestion.testCases.filter(tc => !tc.visible).length} hidden test cases that will be evaluated when you submit your solution.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contest;
