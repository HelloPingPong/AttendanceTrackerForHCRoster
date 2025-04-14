import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Add a small delay to ensure components are mounted
    const timer = setTimeout(() => {
      window.frameworkReady?.();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []); // Add empty dependency array to run only once on mount
}