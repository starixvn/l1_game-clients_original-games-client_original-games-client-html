// Type definitions for OpenReplay tracker
declare global {
    interface Window {
        openreplay?: any;
    }
}

export interface OpenReplayConfig {
    projectKey: string;
    ingestPoint?: string;
    __DISABLE_SECURE_MODE?: boolean;
    defaultInputMode?: 0 | 1 | 2; // InputModeT from OpenReplay
    obscureTextNumbers?: boolean;
    obscureTextEmails?: boolean;
    // CSS and animation capture options
    captureCSS?: boolean;
    disableCSSAnimation?: boolean;
    // Additional options for CSS capture from OpenReplay docs
    css?: {
        scanInMemoryCSS?: boolean;
        checkCssInterval?: number;
        checkLimit?: number;
    };
    // Performance options for animation capture
    capturePerformance?: boolean;
    longTasks?: boolean;
}
