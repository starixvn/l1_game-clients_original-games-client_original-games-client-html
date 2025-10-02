'use client'
import { useEffect, useState } from 'react';
import type { OpenReplayConfig } from './types';
import { getAppSettings } from '@shared/app-settings';

// Get OpenReplay configuration from app settings
const getOpenReplayConfig = (): OpenReplayConfig | null => {
  const appSettings = getAppSettings();
  const openreplayConfig = appSettings.openreplay;
  
  // Check if projectKey is valid (not undefined, null, or empty)
  const projectKey = openreplayConfig?.projectKey;
  if (!projectKey || projectKey.trim() === '') {
    return null;
  }
  
  // Use configuration from app settings or fallback to defaults
  return {
    projectKey: projectKey,
    __DISABLE_SECURE_MODE: openreplayConfig?.disableSecureMode ?? true,
    defaultInputMode: (openreplayConfig?.defaultInputMode as 0 | 1 | 2) || 2,
    obscureTextNumbers: openreplayConfig?.obscureTextNumbers ?? false,
    obscureTextEmails: openreplayConfig?.obscureTextEmails ?? true,
  };
};

// Check if OpenReplay is enabled based on project key availability
const isOpenReplayEnabled = (): boolean => {
  const appSettings = getAppSettings();
  const openreplayConfig = appSettings.openreplay;
  
  // OpenReplay is enabled if project key exists and is not empty
  const hasValidProjectKey = openreplayConfig?.projectKey && openreplayConfig.projectKey.trim() !== '';
  
  return hasValidProjectKey;
};


// Next.js compatible OpenReplay tracker component
export function OpenReplayTracker() {
  const [tracker, setTracker] = useState<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Check if OpenReplay is enabled
    if (!isOpenReplayEnabled()) {
      console.log('OpenReplay: Tracking is disabled - project key is missing or empty');
      return;
    }

    const initializeTracker = async () => {
      try {
        // Dynamic import for Next.js compatibility
        const OpenReplayModule = await import('@openreplay/tracker');
        const OpenReplayTracker = (OpenReplayModule as any).default || (OpenReplayModule as any).tracker;
        
        const config = getOpenReplayConfig();
        if (!config) {
          console.log('OpenReplay: Invalid configuration');
          return;
        }

        // Create and configure tracker
        const trackerInstance = new OpenReplayTracker(config);
        
        // Start tracker
        await trackerInstance.start();
        console.log('OpenReplay: Next.js tracker started successfully');

        // Make tracker available globally
        window.openreplay = trackerInstance;
        setTracker(trackerInstance);

      } catch (error) {
        console.warn('OpenReplay: Failed to initialize Next.js tracker:', error);
        console.log('Continuing without OpenReplay tracking');
      }
    };

    initializeTracker();

    // Cleanup function
    return () => {
      if (tracker) {
        try {
          tracker.stop();
          console.log('OpenReplay: Next.js tracker stopped');
        } catch (error) {
          console.warn('Error stopping OpenReplay tracker:', error);
        }
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}

export default OpenReplayTracker;


// Export utilities
export * from './openreplay-utils';

// Export configuration helpers
export { getOpenReplayConfig, isOpenReplayEnabled };

