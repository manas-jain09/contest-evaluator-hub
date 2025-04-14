
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Award, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { fetchQuestionsByContest } from '@/utils/contestUtils';

interface ContestInfo {
  id: string;
  name: string;
  duration_mins: number;
  contest_code: string;
  start_date: string;
  end_date: string;
}

interface ContestResult {
  totalScore: number;
  questions: Record<number, {
    submitted: boolean;
    score: number;
    maxScore: number;
    testResults?: Array<{
      passed: boolean;
      points: number;
    }>;
  }>;
  completedAt: number;
  cheatingDetected?: boolean;
}

const Summary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState<ContestResult | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load user info, contest info, and results
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get user info
        const userData = sessionStorage.getItem('contestUser');
        if (userData) {
          setUserInfo(JSON.parse(userData));
        }
        
        // Get contest info
        const contestData = sessionStorage.getItem('contestInfo');
        if (contestData) {
          const contestInfo = JSON.parse(contestData);
          setContestInfo(contestInfo);
          
          // Load questions for this contest
          const loadedQuestions = await fetchQuestionsByContest(contestInfo.id);
          setQuestions(loadedQuestions);
        }
        
        // Check for termination flag in URL
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('terminated') === 'true') {
          setIsTerminated(true);
        }
        
        // Get contest results
        const resultData = sessionStorage.getItem('contestResults');
        if (resultData) {
          setResults(JSON.parse(resultData));
        } else {
          // If no results but we're on the summary page, 
          // either contest was terminated or user navigated here directly
          if (!isTerminated) {
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [navigate, location.search]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/10 border-t-primary animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading summary...</p>
        </div>
      </div>
    );
  }
  
  if (!userInfo || !contestInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Session Expired</h1>
          <p className="text-muted-foreground mb-6">Your session has expired or you haven't participated in the contest yet.</p>
          <Button onClick={() => navigate('/')} className="bg-contest-blue text-white hover:bg-contest-blue/90">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 animate-fade-in">
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">{contestInfo.name}</div>
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = 'https://contest.arenahq-mitwpu.in/')}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="max-w-3xl mx-auto">
          {isTerminated || (results && results.cheatingDetected) ? (
            <div className="bg-white rounded-xl p-6 shadow-subtle border border-contest-red/20 mb-6">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-contest-red/10 flex items-center justify-center mr-4 flex-shrink-0">
                  <XCircle className="h-6 w-6 text-contest-red" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-contest-red">Contest Terminated</h2>
                  <p className="text-muted-foreground mt-2">
                    Your contest was terminated because you exited fullscreen mode for too long.
                    This is a violation of the contest rules.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-subtle border border-contest-green/20 mb-6">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-contest-green/10 flex items-center justify-center mr-4 flex-shrink-0">
                  <Award className="h-6 w-6 text-contest-green" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Contest Completed!</h2>
                  <p className="text-muted-foreground mt-1">
                    Congratulations on completing {contestInfo.name}. Here's a summary of your performance.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-subtle border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">Contest Summary</h1>
              
              <div className="flex items-center">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{userInfo.name}</span> · {userInfo.email}
                </div>
              </div>
              
              {results && questions.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-sm text-muted-foreground mb-1">Total Score</div>
                      <div className="text-3xl font-bold">{results.totalScore}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-sm text-muted-foreground mb-1">Questions Attempted</div>
                      <div className="text-3xl font-bold">
                        {Object.values(results.questions).filter(q => q.submitted).length} / {questions.length}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
                    
                    <div className="space-y-4">
                      {questions.map((question) => {
                        const questionResult = results.questions[question.id];
                        
                        return (
                          <div key={question.id} className="question-card">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{question.title}</h4>
                                
                                <div className="flex items-center mt-1">
                                  {questionResult?.submitted ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-contest-green mr-1.5" />
                                      <span className="text-sm text-contest-green">Submitted</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-contest-red mr-1.5" />
                                      <span className="text-sm text-contest-red">Not Submitted</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-xl font-semibold">
                                  {questionResult?.score || 0} / {questionResult?.maxScore || 0}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  points
                                </div>
                              </div>
                            </div>
                            
                            {questionResult?.submitted && questionResult?.testResults && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-sm text-muted-foreground mb-2">Test Cases</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-contest-green mr-1.5" />
                                    <span className="text-sm">
                                      {questionResult.testResults.filter(r => r.passed).length} passed
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <XCircle className="h-4 w-4 text-contest-red mr-1.5" />
                                    <span className="text-sm">
                                      {questionResult.testResults.filter(r => !r.passed).length} failed
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {isTerminated && !results && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-contest-red mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">No results available</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your contest was terminated before any results could be recorded.
                        Please follow contest rules in your next attempt.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Summary;
