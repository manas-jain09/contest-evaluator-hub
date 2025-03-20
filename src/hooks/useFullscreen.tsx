
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/sonner";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
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
        // First time warning, or after a previous warning was handled
        if (!warningShown) {
          setWarningShown(true);
          setExitStartTime(Date.now());
          
          toast.warning("Please return to fullscreen mode to continue the contest", {
            duration: 5000,
            action: {
              label: "Return to Fullscreen",
              onClick: enterFullscreen,
            },
          });
          
          // Set timeout to check if user hasn't returned to fullscreen
          const timeout = setTimeout(() => {
            if (!document.fullscreenElement) {
              // If they've been out of fullscreen for 30+ seconds
              if (exitStartTime && Date.now() - exitStartTime >= 30000) {
                toast.error("Contest terminated due to fullscreen violation.", {
                  duration: Infinity,
                });
                // Redirect to summary with special termination flag
                window.location.href = "/summary?terminated=true";
              }
            }
          }, 30000);
          
          setTimeoutFullscreenExit(timeout);
        }
      } else {
        // User returned to fullscreen, clear warning state
        setWarningShown(false);
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
  }, [warningShown, exitStartTime, timeoutFullscreenExit, enterFullscreen]);
  
  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    warningShown
  };
}
