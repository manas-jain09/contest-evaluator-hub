import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createMockContest } from "@/utils/mockContest";

const Index = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-load');
    
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-fade-in');
        element.classList.remove('opacity-0');
      }, 100 * index);
    });
  }, []);

  const navigate = useNavigate();

  const handleCreateMockContest = async () => {
    const mockContestId = await createMockContest();
    if (mockContestId) {
      toast.success("Mock contest created. You'll be redirected to the practice contest.");
      setTimeout(() => {
        navigate('/contest/practice123');
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Code Arena</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome to Code Arena, a platform for coding assessments and practice.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4">Take an Assessment</h2>
          <p className="text-gray-600 mb-6">
            Enter your contest code and details to start your assessment.
          </p>
          <Button onClick={() => navigate('/register')} className="w-full bg-contest-red hover:bg-contest-red/90">
            Enter Contest
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4">Practice Mode</h2>
          <p className="text-gray-600 mb-6">
            Try our practice mode with sample coding and MCQ questions.
          </p>
          <Button onClick={handleCreateMockContest} className="w-full">
            Start Practice
          </Button>
        </div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block animate-on-load opacity-0 bg-gray-100 text-gray-800 text-sm font-medium py-1 px-3 rounded-full">
              Welcome to
            </div>
            
            <h1 className="animate-on-load opacity-0 text-5xl sm:text-6xl font-bold tracking-tight">
              Arena <span className="text-contest-blue">Contest</span>
            </h1>
            
            <p className="animate-on-load opacity-0 text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Test your programming skills and compete with others in our coding arena.
              Solve challenging problems and improve your algorithmic thinking.
            </p>
          </div>
          
          <div className="animate-on-load opacity-0 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
            <Link to="/register">
              <Button size="lg" className="bg-contest-blue text-white hover:bg-contest-blue/90 transition-colors">
                Register & Participate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="animate-on-load opacity-0 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-subtle border border-gray-100">
              <div className="h-12 w-12 bg-contest-blue/10 rounded-lg flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-contest-blue">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-time Evaluation</h3>
              <p className="text-muted-foreground text-sm">Get instant feedback on your code with our powerful testing system.</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-subtle border border-gray-100">
              <div className="h-12 w-12 bg-contest-blue/10 rounded-lg flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-contest-blue">
                  <path d="M2 20h.01"></path>
                  <path d="M7 20v-4"></path>
                  <path d="M12 20v-8"></path>
                  <path d="M17 20V8"></path>
                  <path d="M22 4v16"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Performance Metrics</h3>
              <p className="text-muted-foreground text-sm">Track your progress and see how your solutions compare to others.</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-subtle border border-gray-100">
              <div className="h-12 w-12 bg-contest-blue/10 rounded-lg flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-contest-blue">
                  <path d="M12 2v20"></path>
                  <path d="m17 5-5-3-5 3"></path>
                  <path d="m17 19-5 3-5-3"></path>
                  <path d="M2 12h20"></path>
                  <path d="m5 7-3 5 3 5"></path>
                  <path d="m19 7 3 5-3 5"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Algorithmic Challenges</h3>
              <p className="text-muted-foreground text-sm">Solve diverse problems that will enhance your programming skills.</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-gray-100 bg-white">
        <div className="container mx-auto py-4 px-6">
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Arena Contest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
