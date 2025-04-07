
import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFullscreen } from '@/hooks/useFullscreen';

interface FullscreenAlertProps {
  isActive: boolean;
}

const FullscreenAlert: React.FC<FullscreenAlertProps> = ({ isActive }) => {
  const { enterFullscreen, warningShown } = useFullscreen();
  
  if (!isActive || !warningShown) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-elevated max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-start mb-4">
          <AlertCircle className="h-6 w-6 text-contest-red mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">Fullscreen Mode Required</h3>
            <p className="text-muted-foreground mt-2">
              The contest requires fullscreen mode. Exiting fullscreen for more than 30 seconds will terminate your contest.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={enterFullscreen}
            className="bg-contest-blue text-white hover:bg-contest-blue/90 transition-colors"
          >
            Return to Fullscreen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenAlert;
