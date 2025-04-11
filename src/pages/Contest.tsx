
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/utils/toast';
import CodeEditor from '@/components/CodeEditor';
import TestCaseResult from '@/components/TestCaseResult';
import FullscreenAlert from '@/components/FullscreenAlert';
import ResultsDialog from '@/components/ResultsDialog';
import { useFullscreen } from '@/hooks/useFullscreen';
import { 
  fetchQuestionsByContest,
  fetchContestByCode,
  submitCode, 
  getSubmissionResult, 
  getLanguageTemplates,
  saveContestResults,
  isPracticeContest,
  savePracticeProgress,
  loadPracticeProgress
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
  type: 'assessment' | 'practice';
  public_access: boolean;
}

const Contest = () => {
  const navigate = useNavigate();
  const { contestCode, prn } = useParams();
  const { isFullscreen, warningShown, enterFullscreen } = useFullscreen();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [questionTemplates, setQuestionTemplates] = useState<Record<string, Record<number, string>>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, number>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPractice, setIsPractice] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [practiceResults, setPracticeResults] = useState<{
    results: TestResult[],
    score: number,
    maxScore: number
  }>({
    results: [],
    score: 0,
    maxScore: 0
  });
  
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (!isPractice || !currentQuestion || !contestInfo) return;
    
    const autoSaveInterval = setInterval(() => {
      const currentCode = userCode[currentQuestion.id];
      const currentLanguage = selectedLanguages[currentQuestion.id];
      
      if (currentCode && currentLanguage) {
        savePracticeProgress(contestInfo.id, currentCode, currentLanguage, prn);
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [isPractice, currentQuestion, contestInfo, userCode, selectedLanguages, prn]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (contestCode) {
          try {
            const contest = await fetchContestByCode(contestCode);
            
            if (!contest || !contest.public_access) {
              toast.error("Contest not found or not publicly accessible");
              navigate('/register');
              return;
            }
            
            const typedContest: ContestInfo = {
              ...contest,
              type: contest.type === 'practice' ? 'practice' : 'assessment'
            };
            
            setContestInfo(typedContest);
            const isPracticeMode = typedContest.type === 'practice';
            setIsPractice(isPracticeMode);
            
            const fetchedQuestions = await fetchQuestionsByContest(contest.id);
            setQuestions(fetchedQuestions);
            
            const defaultTemplates = await getLanguageTemplates();
            
            const initialUserCode: Record<number, string> = {};
            const initialSelectedLanguages: Record<number, number> = {};
            const initialTemplates: Record<number, Record<number, string>> = {};
            
            await Promise.all(fetchedQuestions.map(async (q) => {
              let languageId = 54;
              initialSelectedLanguages[q.id] = languageId;
              
              const questionSpecificTemplates = await getLanguageTemplates(q.id);
              
              initialTemplates[q.id] = {
                ...defaultTemplates,
                ...questionSpecificTemplates
              };
              
              if (isPracticeMode) {
                const progress = await loadPracticeProgress(contest.id, prn);
                if (progress.code && progress.languageId) {
                  initialUserCode[q.id] = progress.code;
                  initialSelectedLanguages[q.id] = progress.languageId;
                  languageId = progress.languageId;
                } else {
                  initialUserCode[q.id] = initialTemplates[q.id][languageId] || defaultTemplates[languageId] || '';
                }
              } else {
                initialUserCode[q.id] = initialTemplates[q.id][languageId] || defaultTemplates[languageId] || '';
              }
            }));
            
            setQuestionTemplates(initialTemplates);
            setUserCode(initialUserCode);
            setSelectedLanguages(initialSelectedLanguages);
            
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Error fetching contest from URL:", error);
            toast.error("Invalid contest code in URL");
            navigate('/register');
            return;
          }
        }
        
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
        
        const typedContest: ContestInfo = {
          ...contest,
          type: contest.type === 'practice' ? 'practice' : 'assessment'
        };
        
        setContestInfo(typedContest);
        
        const practiceMode = await isPracticeContest(contest.id);
        setIsPractice(practiceMode);
        
        const fetchedQuestions = await fetchQuestionsByContest(contest.id);
        setQuestions(fetchedQuestions);
        
        const defaultTemplates = await getLanguageTemplates();
        
        const initialUserCode: Record<number, string> = {};
        const initialSelectedLanguages: Record<number, number> = {};
        const initialTemplates: Record<number, Record<number, string>> = {};
        
        await Promise.all(fetchedQuestions.map(async (q) => {
          let languageId = 54;
          initialSelectedLanguages[q.id] = languageId;
          
          const questionSpecificTemplates = await getLanguageTemplates(q.id);
          
          initialTemplates[q.id] = {
            ...defaultTemplates,
            ...questionSpecificTemplates
          };
          
          if (practiceMode) {
            const progress = await loadPracticeProgress(contest.id, prn);
            if (progress.code && progress.languageId) {
              initialUserCode[q.id] = progress.code;
              initialSelectedLanguages[q.id] = progress.languageId;
              languageId = progress.languageId;
            } else {
              initialUserCode[q.id] = initialTemplates[q.id][languageId] || defaultTemplates[languageId] || '';
            }
          } else {
            initialUserCode[q.id] = initialTemplates[q.id][languageId] || defaultTemplates[languageId] || '';
          }
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
  }, [navigate, contestCode, prn]);
  
  useEffect(() => {
    if (!contestInfo || isPractice) return;
    
    if (document.documentElement.requestFullscreen && !isFullscreen) {
      enterFullscreen();
    }
    
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
  }, [contestInfo, navigate, isPractice, isFullscreen, enterFullscreen]);
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (questionId: string, code: string) => {
    setUserCode(prev => ({
      ...prev,
      [questionId]: code
    }));
    
    if (isPractice && contestInfo) {
      savePracticeProgress(contestInfo.id, code, selectedLanguages[questionId] || 54, prn);
    }
  };
  
  const handleLanguageChange = (questionId: string, languageId: number) => {
    setSelectedLanguages(prev => ({
      ...prev,
      [questionId]: languageId
    }));
    
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

      const maxScore = allTestCases.reduce((total, tc: any) => total + (tc.points || 0), 0);
      
      if (isPractice) {
        const formattedResults = results.map((r, idx) => ({
          index: idx + 1,
          status: r.isSuccess ? 'success' as const : 'error' as const,
          input: r.testCase.input,
          expected: r.testCase.expected,
          output: r.result?.stdout || r.result?.stderr || r.result?.compile_output,
          points: r.testCase.points,
          visible: r.testCase.visible
        }));
        
        setPracticeResults({
          results: formattedResults,
          score,
          maxScore
        });
        
        setResultsDialogOpen(true);
        
        await saveContestResults(
          contestInfo.id,
          null,
          score,
          false,
          [{
            questionId: currentQuestion.id,
            languageId,
            code,
            score
          }],
          prn
        );
      } else {
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
    if (!contestInfo) {
      toast.error("Missing contest information");
      navigate('/');
      return;
    }
    
    if (isPractice) return;
    
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
      
      const cheatingDetected = typeof warningShown === 'number' && warningShown > 1;
      
      if (userInfo) {
        await saveContestResults(
          contestInfo.id,
          userInfo,
          totalScore,
          cheatingDetected,
          submissionsArray,
          prn
        );
      }
      
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/10 border-t-primary animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-md max-w-md">
          <h2 className="text-lg font-medium text-red-600 mb-2">No Questions Available</h2>
          <p className="text-sm text-gray-600 mb-4">
            There are no questions available for this contest. Please contact the administrator.
          </p>
          <Button 
            className="bg-contest-red hover:bg-contest-red/90"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isPractice && <FullscreenAlert isActive={!isFullscreen} />}
      
      <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 z-10">
        <div className="text-lg font-semibold">
          {prn && <span className="text-sm text-muted-foreground ml-2">PRN: {prn}</span>}
        </div>
        
        <div className="flex items-center space-x-8">
          {!isPractice && timeLeft !== null && (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Time Remaining:</span>
              <div className={`font-mono text-sm font-medium rounded px-2 py-1 flex items-center ${timeLeft < 5 * 60 * 1000 ? 'bg-contest-red/10 text-contest-red' : 'bg-red-50 text-contest-red'}`}>
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
          
          {!isPractice && (
            <Button 
              onClick={handleEndContest}
              variant="outline" 
              size="sm"
              className="border-contest-red/20 text-contest-red hover:bg-contest-red/5 hover:text-contest-red"
            >
              End Contest
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-grow flex overflow-hidden">
        <div className="w-1/2 contest-panel-left">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="bg-contest-red/10 text-contest-red text-xs font-medium px-2 py-1 rounded mr-2">
                Question {currentQuestionIndex + 1}/{questions.length}
              </span>
              {submittedQuestions[currentQuestion.id] && !isPractice && (
                <span className="flex items-center text-xs text-contest-green bg-contest-green/10 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Submitted
                </span>
              )}
            </div>
            
            {questions.length > 1 && (
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
            )}
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
            onCodeChange={(code) => handleCodeChange(currentQuestion.id, code)}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Test Results</h3>
            
            {isProcessing && (
              <div className="bg-red-50 rounded-md p-4 flex items-center text-contest-red mb-3">
                <div className="h-4 w-4 rounded-full border-2 border-contest-red/30 border-t-contest-red animate-spin mr-3"></div>
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

      {isPractice && (
        <ResultsDialog
          isOpen={resultsDialogOpen}
          setIsOpen={setResultsDialogOpen}
          results={practiceResults.results}
          score={practiceResults.score}
          maxScore={practiceResults.maxScore}
        />
      )}
    </div>
  );
};

export default Contest;
