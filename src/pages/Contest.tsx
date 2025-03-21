
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/utils/toast';
import CodeEditor from '@/components/CodeEditor';
import TestCaseResult from '@/components/TestCaseResult';
import FullscreenAlert from '@/components/FullscreenAlert';
import { useFullscreen } from '@/hooks/useFullscreen';
import { 
  fetchQuestionsByContest,
  submitCode, 
  getSubmissionResult, 
  getLanguageTemplates,
  saveContestResults
} from '@/utils/contestUtils';

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

interface ContestInfo {
  id: string;
  name: string;
  duration_mins: number;
  contest_code: string;
  start_date: string;
  end_date: string;
}

const Contest = () => {
  const navigate = useNavigate();
  const { isFullscreen, warningShown } = useFullscreen();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState<Record<number, string>>({});
  const [testResults, setTestResults] = useState<Record<number, TestResult[]>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [questionTemplates, setQuestionTemplates] = useState<Record<number, Record<number, string>>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<Record<number, number>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const userData = sessionStorage.getItem('contestUser');
        const contestData = sessionStorage.getItem('contestInfo');
        
        if (!userData || !contestData) {
          toast.error("Missing user or contest information");
          navigate('/register');
          return;
        }
        
        const user = JSON.parse(userData);
        const contest = JSON.parse(contestData);
        
        setUserInfo(user);
        setContestInfo(contest);
        
        const fetchedQuestions = await fetchQuestionsByContest(contest.id);
        setQuestions(fetchedQuestions);
        
        // Get default templates for all languages
        const defaultTemplates = await getLanguageTemplates();
        
        // Initialize data structures
        const initialUserCode: Record<number, string> = {};
        const initialSelectedLanguages: Record<number, number> = {};
        const initialTemplates: Record<number, Record<number, string>> = {};
        
        // For each question, fetch its specific templates
        await Promise.all(fetchedQuestions.map(async (q) => {
          // Default to C++ (54) for all questions initially
          initialSelectedLanguages[q.id] = 54;
          
          // Get question-specific templates
          const questionSpecificTemplates = await getLanguageTemplates(q.id);
          
          // Merge default templates with question-specific ones, giving priority to question-specific
          initialTemplates[q.id] = {
            ...defaultTemplates,
            ...questionSpecificTemplates
          };
          
          // Set initial code for this question using the C++ template if available
          initialUserCode[q.id] = initialTemplates[q.id][54] || defaultTemplates[54] || '';
        }));
        
        setQuestionTemplates(initialTemplates);
        setUserCode(initialUserCode);
        setSelectedLanguages(initialSelectedLanguages);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load contest data. Please refresh the page.");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  useEffect(() => {
    if (!contestInfo) return;
    
    const startTime = sessionStorage.getItem('contestStartTime');
    
    if (!startTime) {
      toast.error("You must start the contest from the instructions page");
      navigate('/instructions');
      return;
    }
    
    const contestStartTime = JSON.parse(startTime);
    const contestDurationMs = contestInfo.duration_mins * 60 * 1000;
    const contestEndTime = contestStartTime + contestDurationMs;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = contestEndTime - now;
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        toast.error("Contest time is up!");
        handleEndContest();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [contestInfo, navigate]);
  
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
  
  const handleLanguageChange = (questionId: number, languageId: number) => {
    setSelectedLanguages(prev => ({
      ...prev,
      [questionId]: languageId
    }));
    
    // If we have a template for this language and question, update the code
    if (questionTemplates[questionId] && questionTemplates[questionId][languageId]) {
      setUserCode(prev => ({
        ...prev,
        [questionId]: questionTemplates[questionId][languageId]
      }));
    }
  };
  
  const handleRun = async (code: string, languageId: number) => {
    if (!currentQuestion) return;
    
    setIsProcessing(true);
    
    const initialResults: TestResult[] = currentQuestion.testCases
      .filter((tc: any) => tc.visible)
      .map((tc: any, index: number) => ({
        index: index + 1,
        status: 'processing',
        input: tc.input,
        expected: tc.expected,
        visible: tc.visible,
        points: tc.points
      }));
    
    setTestResults(prev => ({
      ...prev,
      [currentQuestion.id]: initialResults
    }));
    
    try {
      for (let i = 0; i < initialResults.length; i++) {
        const testCase = currentQuestion.testCases.find((tc: any, idx: number) => tc.visible && idx === i);
        if (!testCase) continue;
        
        setTestResults(prev => {
          const updatedResults = [...(prev[currentQuestion.id] || [])];
          updatedResults[i] = {
            ...updatedResults[i],
            status: 'processing'
          };
          return {
            ...prev,
            [currentQuestion.id]: updatedResults
          };
        });
        
        const stdin = testCase.input;
        const expectedOutput = testCase.expected;
        const token = await submitCode(code, languageId, stdin, expectedOutput);
        
        let attempts = 0;
        let result;
        
        while (attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            result = await getSubmissionResult(token);
            if (result.status && result.status.id >= 3) {
              break;
            }
          } catch (error) {
            console.error("Error checking submission status:", error);
          }
          attempts++;
        }
        
        if (result) {
          const isSuccess = 
            result.status.id === 3 &&
            (result.stdout?.trim() === expectedOutput.trim());
          
          setTestResults(prev => {
            const updatedResults = [...(prev[currentQuestion.id] || [])];
            updatedResults[i] = {
              ...updatedResults[i],
              status: isSuccess ? 'success' : 'error',
              output: result.stdout || result.stderr || result.compile_output || 'No output',
              message: !isSuccess ? (
                result.status.id === 3 ? 'Output does not match expected result.' :
                result.status.description
              ) : undefined
            };
            return {
              ...prev,
              [currentQuestion.id]: updatedResults
            };
          });
        } else {
          setTestResults(prev => {
            const updatedResults = [...(prev[currentQuestion.id] || [])];
            updatedResults[i] = {
              ...updatedResults[i],
              status: 'error',
              message: 'Evaluation timed out or failed.'
            };
            return {
              ...prev,
              [currentQuestion.id]: updatedResults
            };
          });
        }
      }
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("Error running code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSubmit = async (code: string, languageId: number) => {
    if (!currentQuestion || !contestInfo) return;
    
    setIsProcessing(true);
    toast.info("Submitting your solution...");
    
    try {
      const allTestCases = currentQuestion.testCases;
      const results = [];
      
      for (const testCase of allTestCases) {
        const stdin = testCase.input;
        const expectedOutput = testCase.expected;
        const token = await submitCode(code, languageId, stdin, expectedOutput);
        
        let attempts = 0;
        let result;
        
        while (attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            result = await getSubmissionResult(token);
            if (result.status && result.status.id >= 3) {
              break;
            }
          } catch (error) {
            console.error("Error checking submission status:", error);
          }
          attempts++;
        }
        
        if (result) {
          const isSuccess = 
            result.status.id === 3 &&
            (result.stdout?.trim() === expectedOutput.trim());
          
          results.push({
            testCase,
            result,
            isSuccess
          });
        } else {
          results.push({
            testCase,
            result: null,
            isSuccess: false
          });
        }
      }
      
      const score = results.reduce((total, { testCase, isSuccess }) => {
        return total + (isSuccess ? (testCase.points || 0) : 0);
      }, 0);
      
      setSubmittedQuestions(prev => ({
        ...prev,
        [currentQuestion.id]: true
      }));
      
      const storedSubmissions = JSON.parse(sessionStorage.getItem('contestSubmissions') || '{}');
      const updatedSubmissions = {
        ...storedSubmissions,
        [currentQuestion.id]: {
          code,
          languageId,
          timestamp: Date.now(),
          score,
          results: results.map(r => ({
            testCaseId: r.testCase.input,
            passed: r.isSuccess,
            points: r.isSuccess ? r.testCase.points : 0
          }))
        }
      };
      
      sessionStorage.setItem('contestSubmissions', JSON.stringify(updatedSubmissions));
      
      toast.success("Solution submitted successfully!");
      
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
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
  
  const handleEndContest = async () => {
    if (!contestInfo || !userInfo) {
      toast.error("Missing contest or user information");
      navigate('/');
      return;
    }
    
    try {
      const results: Record<number, any> = {};
      let totalScore = 0;
      
      const storedSubmissions = JSON.parse(sessionStorage.getItem('contestSubmissions') || '{}');
      const submissionsArray = [];
      
      questions.forEach(question => {
        const submission = storedSubmissions[question.id];
        
        if (submission) {
          results[question.id] = {
            submitted: true,
            score: submission.score || 0,
            maxScore: question.testCases.reduce((sum: number, tc: any) => sum + (tc.points || 0), 0),
            languageId: submission.languageId,
            testResults: submission.results
          };
          totalScore += submission.score || 0;
          
          submissionsArray.push({
            questionId: question.id,
            languageId: submission.languageId,
            code: submission.code,
            score: submission.score || 0
          });
        } else {
          results[question.id] = {
            submitted: false,
            score: 0,
            maxScore: question.testCases.reduce((sum: number, tc: any) => sum + (tc.points || 0), 0)
          };
        }
      });
      
      const cheatingDetected = warningShown > 1;
      
      await saveContestResults(
        contestInfo.id,
        userInfo,
        totalScore,
        cheatingDetected,
        submissionsArray
      );
      
      sessionStorage.setItem('contestResults', JSON.stringify({
        totalScore,
        questions: results,
        completedAt: Date.now(),
        cheatingDetected
      }));
      
      navigate('/summary');
    } catch (error) {
      console.error("Error ending contest:", error);
      toast.error("Error saving contest results. Your results may not be properly recorded.");
      navigate('/summary');
    }
  };
  
  if (isLoading || timeLeft === null || !currentQuestion) {
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
        <div className="text-lg font-semibold">
          {contestInfo?.name || "Arena Contest"}
        </div>
        
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
                {currentQuestion.examples.map((example: any, index: number) => (
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
                {currentQuestion.constraints.map((constraint: string, index: number) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="w-1/2 contest-panel-right">
          <CodeEditor 
            initialCode={userCode[currentQuestion.id] || ''}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            languageTemplates={questionTemplates[currentQuestion.id] || {}}
            questionId={currentQuestion.id}
            onLanguageChange={(languageId) => handleLanguageChange(currentQuestion.id, languageId)}
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
            
            {currentQuestion.testCases.some((tc: any) => !tc.visible) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-100">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Note:</span> There are {currentQuestion.testCases.filter((tc: any) => !tc.visible).length} hidden test cases that will be evaluated when you submit your solution.
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
