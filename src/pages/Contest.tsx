
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toast';
import CodeEditor from '@/components/CodeEditor';
import TestCaseResult from '@/components/TestCaseResult';
import ResultsDialog from '@/components/ResultsDialog';
import { 
  fetchQuestionsByContest,
  fetchContestById,
  submitCode, 
  getSubmissionResult, 
  getLanguageTemplates,
  saveContestResults,
  savePracticeProgress,
  loadPracticeProgress
} from '@/utils/contestUtils';
import { verifyToken } from '@/utils/tokenUtils';

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
  const { token } = useParams();
  const [userCode, setUserCode] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [questionTemplates, setQuestionTemplates] = useState<Record<number, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<number>(54); // Default to C++
  const [question, setQuestion] = useState<any>(null);
  const [contestInfo, setContestInfo] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Extract data from token if available
        let contestId = '';
        let userIdFromToken = '';
        
        if (token) {
          // Update here: await the Promise returned by verifyToken
          const tokenData = await verifyToken(token);
          if (tokenData) {
            contestId = tokenData.questionId || '';
            userIdFromToken = tokenData.userId || '';
            setUserId(userIdFromToken);
          } else {
            toast.error("Invalid token");
            return;
          }
        } else {
          toast.error("No token provided");
          return;
        }
        
        // Fetch contest and question data
        if (contestId) {
          try {
            const contest = await fetchContestById(contestId);
            if (!contest) {
              toast.error("Contest not found");
              return;
            }
            
            setContestInfo(contest);
            
            // Fetch questions for this contest
            const fetchedQuestions = await fetchQuestionsByContest(contest.id);
            if (fetchedQuestions.length === 0) {
              toast.error("No questions found for this contest");
              return;
            }
            
            // Use the first question (since we're only displaying one)
            setQuestion(fetchedQuestions[0]);
            
            // Get language templates
            const defaultTemplates = await getLanguageTemplates();
            const questionSpecificTemplates = await getLanguageTemplates(fetchedQuestions[0].id);
            
            const templates = {
              ...defaultTemplates,
              ...questionSpecificTemplates
            };
            
            setQuestionTemplates(templates);
            
            // Load saved progress if available
            const progress = await loadPracticeProgress(contest.id, userIdFromToken);
            if (progress.code && progress.languageId) {
              setUserCode(progress.code);
              setSelectedLanguage(progress.languageId);
            } else {
              // Set default code based on selected language
              setUserCode(templates[selectedLanguage] || '');
            }
            
            setIsLoading(false);
          } catch (error) {
            console.error("Error fetching contest data:", error);
            toast.error("Error loading contest");
            setIsLoading(false);
          }
        } else {
          toast.error("No contest ID provided in token");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        toast.error("Failed to load content");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
  // Save progress periodically
  useEffect(() => {
    if (!contestInfo || !userId || !userCode) return;
    
    const autoSaveInterval = setInterval(() => {
      savePracticeProgress(contestInfo.id, userCode, selectedLanguage, userId);
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [contestInfo, userId, userCode, selectedLanguage]);
  
  const handleCodeChange = (code: string) => {
    setUserCode(code);
    
    if (contestInfo && userId) {
      savePracticeProgress(contestInfo.id, code, selectedLanguage, userId);
    }
  };
  
  const handleLanguageChange = (languageId: number) => {
    setSelectedLanguage(languageId);
    
    if (questionTemplates[languageId]) {
      setUserCode(questionTemplates[languageId]);
    }
  };
  
  const handleRun = async (code: string, languageId: number) => {
    if (!question) return;
    
    setIsProcessing(true);
    
    const initialResults: TestResult[] = question.testCases
      .filter((tc: any) => tc.visible)
      .map((tc: any, index: number) => ({
        index: index + 1,
        status: 'processing',
        input: tc.input,
        expected: tc.expected,
        visible: tc.visible,
        points: tc.points
      }));
    
    setTestResults(initialResults);
    
    try {
      for (let i = 0; i < initialResults.length; i++) {
        const testCase = question.testCases.find((tc: any, idx: number) => tc.visible && idx === i);
        if (!testCase) continue;
        
        setTestResults(prev => {
          const updatedResults = [...prev];
          updatedResults[i] = {
            ...updatedResults[i],
            status: 'processing'
          };
          return updatedResults;
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
            const updatedResults = [...prev];
            updatedResults[i] = {
              ...updatedResults[i],
              status: isSuccess ? 'success' : 'error',
              output: result.stdout || result.stderr || result.compile_output || 'No output',
              message: !isSuccess ? (
                result.status.id === 3 ? 'Output does not match expected result.' :
                result.status.description
              ) : undefined
            };
            return updatedResults;
          });
        } else {
          setTestResults(prev => {
            const updatedResults = [...prev];
            updatedResults[i] = {
              ...updatedResults[i],
              status: 'error',
              message: 'Evaluation timed out or failed.'
            };
            return updatedResults;
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
    if (!question || !contestInfo || !userId) return;
    
    setIsProcessing(true);
    toast.info("Submitting your solution...");
    
    try {
      const allTestCases = question.testCases;
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
      
      // Save user progress
      await saveContestResults(
        contestInfo.id,
        null,
        score,
        false,
        [{
          questionId: question.id,
          languageId,
          code,
          score
        }],
        userId
      );
      
      toast.success("Solution submitted successfully!");
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Error submitting solution. Please try again.");
    } finally {
      setIsProcessing(false);
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

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-md max-w-md">
          <h2 className="text-lg font-medium text-red-600 mb-2">No Question Available</h2>
          <p className="text-sm text-gray-600 mb-4">
            There is no question available for this contest. Please contact the administrator.
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
      <main className="flex-grow flex overflow-hidden">
        <div className="w-1/2 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <div className="text-sm whitespace-pre-line">
                {question.description}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Examples</h3>
              <div className="space-y-4">
                {question.examples.map((example: any, index: number) => (
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
                {question.constraints.map((constraint: string, index: number) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="w-1/2 p-6 overflow-y-auto">
          <CodeEditor 
            initialCode={userCode}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            languageTemplates={questionTemplates}
            questionId={question.id}
            onLanguageChange={handleLanguageChange}
            onCodeChange={handleCodeChange}
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
              {!testResults || testResults.length === 0 ? (
                <div className="bg-gray-50 rounded-md p-6 border border-gray-100 text-center">
                  <p className="text-muted-foreground text-sm">
                    Run your code to see test results
                  </p>
                </div>
              ) : (
                testResults.map((result, index) => (
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
            
            {question.testCases.some((tc: any) => !tc.visible) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-100">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Note:</span> There are {question.testCases.filter((tc: any) => !tc.visible).length} hidden test cases that will be evaluated when you submit your solution.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ResultsDialog
        isOpen={resultsDialogOpen}
        setIsOpen={setResultsDialogOpen}
        results={practiceResults.results}
        score={practiceResults.score}
        maxScore={practiceResults.maxScore}
      />
    </div>
  );
};

export default Contest;
