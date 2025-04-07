
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/utils/toast";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [timeoutFullscreenExit, setTimeoutFullscreenExit] = useState<NodeJS.Timeout | null>(null);
  const [exitStartTime, setExitStartTime] = useState<number | null>(null);
  
  // Request fullscreen
  const enterFullscreen = useCallback(() => {
    const docEl = document.documentElement;
    
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
          toast.error("Unable to enter fullscreen mode. Please enable fullscreen permissions for this site.");
        });
    } else {
      toast.error("Fullscreen is not supported in your browser. Please use a modern browser.");
    }
  }, []);
  
  // Exit fullscreen
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error(`Error attempting to exit fullscreen: ${err.message}`));
    }
  }, []);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);
  
  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If the user exits fullscreen without using our controls
      if (!isCurrentlyFullscreen) {
        // Increment the fullscreen exit count
        setFullscreenExitCount(prev => prev + 1);
        
        // If this is the second exit, terminate the contest immediately
        if (fullscreenExitCount >= 1) {
          toast.error("Contest terminated due to multiple fullscreen violations.", {
            duration: Infinity,
          });
          // Redirect to summary with termination flag
          window.location.href = "/summary?terminated=true";
          return;
        }
        
        setExitStartTime(Date.now());
          
        toast.warning("Please return to fullscreen mode to continue the contest", {
          duration: 5000,
          action: {
            label: "Return to Fullscreen",
            onClick: enterFullscreen,
          },
        });
          
        // Set timeout to check if user hasn't returned to fullscreen within 30 seconds
        const timeout = setTimeout(() => {
          if (!document.fullscreenElement) {
            toast.error("Contest terminated due to fullscreen violation.", {
              duration: Infinity,
            });
            // Redirect to summary with special termination flag
            window.location.href = "/summary?terminated=true";
          }
        }, 30000);
          
        setTimeoutFullscreenExit(timeout);
      } else {
        // User returned to fullscreen, clear warning state
        setExitStartTime(null);
        
        if (timeoutFullscreenExit) {
          clearTimeout(timeoutFullscreenExit);
          setTimeoutFullscreenExit(null);
        }
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      if (timeoutFullscreenExit) {
        clearTimeout(timeoutFullscreenExit);
      }
    };
  }, [fullscreenExitCount, enterFullscreen, timeoutFullscreenExit]);
  
  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    fullscreenExitCount,
    warningShown: fullscreenExitCount // Expose fullscreenExitCount as warningShown for backward compatibility
  };
}
