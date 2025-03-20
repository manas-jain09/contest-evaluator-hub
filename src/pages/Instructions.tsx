
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClockIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { useFullscreen } from '@/hooks/useFullscreen';

const Instructions = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);
  const { enterFullscreen } = useFullscreen();
  
  useEffect(() => {
    // Check if user is registered
    const userData = sessionStorage.getItem('contestUser');
    if (!userData) {
      toast.error("You must register before accessing the instructions");
      navigate('/register');
      return;
    }
    
    setUserInfo(JSON.parse(userData));
  }, [navigate]);
  
  const handleStartContest = () => {
    if (!accepted) {
      toast.error("You must accept the contest rules to continue");
      return;
    }
    
    // Enter fullscreen before starting contest
    enterFullscreen();
    
    // Store contest start time
    sessionStorage.setItem('contestStartTime', JSON.stringify(Date.now()));
    
    setTimeout(() => {
      navigate('/contest');
    }, 500);
  };
  
  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/10 border-t-primary animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">Arena Contest</div>
            <div className="text-sm text-muted-foreground">
              Welcome, {userInfo.name}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 mb-6">
            <h1 className="text-3xl font-bold">Contest Instructions</h1>
            <p className="text-muted-foreground">
              Please read the following instructions carefully before starting the contest.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-subtle border border-gray-100 space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <ClockIcon className="h-8 w-8 text-contest-blue" />
              <div>
                <h3 className="font-semibold">Contest Duration: 1 hour</h3>
                <p className="text-sm text-muted-foreground">The timer starts once you click the "Begin Contest" button.</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">General Guidelines</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>The contest consists of multiple algorithmic problems to solve.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>Each problem has visible and hidden test cases, with points assigned to each.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>You can navigate between problems freely during the contest duration.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>Use the "Run" button to test your code against visible test cases before final submission.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>Use the "Submit" button to make your final submission for a problem, which will be used for scoring.</span>
                </li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Evaluation Process</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>Your code is evaluated against both visible and hidden test cases.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>Points are awarded based on the number of test cases passed.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-contest-green mt-0.5 mr-2 flex-shrink-0" />
                  <span>Time and space complexity are considered for optimal solutions.</span>
                </li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Important Notes</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-contest-red mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Fullscreen requirement:</strong> The contest must be taken in fullscreen mode. Exiting fullscreen more than once or for more than 30 seconds will terminate your contest attempt.</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-contest-red mt-0.5 mr-2 flex-shrink-0" />
                  <span>Do not refresh the page during the contest, as it may result in loss of your progress.</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-contest-red mt-0.5 mr-2 flex-shrink-0" />
                  <span>Ensure you have a stable internet connection throughout the contest.</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={accepted} 
                  onChange={() => setAccepted(!accepted)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I have read and understood all the instructions, and I agree to follow the contest rules.
                </span>
              </label>
            </div>
            
            <Button 
              onClick={handleStartContest}
              className="w-full bg-contest-blue text-white hover:bg-contest-blue/90 transition-colors"
              disabled={!accepted}
            >
              Begin Contest
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Instructions;
