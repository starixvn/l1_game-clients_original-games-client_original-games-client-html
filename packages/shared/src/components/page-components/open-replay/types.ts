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
}
