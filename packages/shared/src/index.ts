// Shared package exports
export * from './app-settings';
export * from './constants';
export * from './game-config';
export * from './game-registry';
export * from './helpers';
export * from './react-contexts';
export * from './react-hooks';
export * from './resources';
export * from './services';
export * from './stores';
export * from './utils';

// Page components
export { default as GameApp } from './components/page-components/app/App';
export { AppTitle } from './components/page-components/app/App';
export { default as GameDocument } from './components/page-components/document/Document';
export { default as GameHome } from './components/page-components/home/Home';
export { default as GameError } from './components/page-components/error/MyError';
export { default as Game404 } from './components/page-components/error/Custom404';
export { default as GameTimeout } from './components/page-components/error/timeout';

// React hooks providers
export { default as BalanceSyncProvider } from './react-hooks/providers/balance-sync-provider';

// Game registry template
export { registerCurrentGame } from './game-registry/game-registry-template';

// Games component
export { Games, type GamesProps } from './components/game-components/games';

// Logger Controls component
export { default as LoggerControls } from './components/game-components/logger-controls/LoggerControls';

// API endpoints
export { default as healthApi } from './api/health';
// Note: preloadImagesApi is server-side only, import directly when needed

// Utilities
export { default as imageLoader } from './image-loader';

// Sentry configurations are loaded automatically by Next.js