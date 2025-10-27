// Centralized basePath configuration for better maintainability
// This is the single source of truth for basePath across the entire application

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const BASE_PATH = rawBasePath;

// Debug logging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.log('🔧 BASE_PATH Debug:', {
        BASE_PATH,
        rawBasePath,
        envVar: process.env.NEXT_PUBLIC_BASE_PATH,
        userAgent: navigator.userAgent.substring(0, 50)
    });
}

// For SCSS usage - can be imported in SCSS files
export const BASE_PATH_SCSS = BASE_PATH || "/";

// Helper functions for common basePath operations
export const withBasePath = (path: string): string => {
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    return BASE_PATH + path;
};

export const isBasePathSet = (): boolean => {
    return BASE_PATH !== "";
};

export const getFullUrl = (relativePath: string): string => {
    const path = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
    return BASE_PATH + path;
};

// For development/debugging
export const getBasePathInfo = () => ({
    basePath: BASE_PATH,
    isSet: isBasePathSet(),
    environment: process.env.NODE_ENV,
    nextPublicBasePath: process.env.NEXT_PUBLIC_BASE_PATH,
});
