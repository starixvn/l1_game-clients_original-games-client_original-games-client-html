# Plinko Microsite Implementation

This document provides a comprehensive overview of the Plinko microsite implementation, including the splash screen, auth service, dashboard, socket connection, and balance service components.

## 🏗️ Architecture Overview

The Plinko microsite follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Plinko Microsite                        │
├─────────────────────────────────────────────────────────────┤
│  SplashScreen → Dashboard → Game Components                │
│       ↓              ↓              ↓                      │
│  Auth Service → Balance Service → Socket Service           │
│       ↓              ↓              ↓                      │
│  Enhanced Logger → Shared Services → Game Logic            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── components/
│   ├── splash-screen/
│   │   ├── SplashScreen.tsx
│   │   ├── splash-screen.module.scss
│   │   ├── fade-content.tsx
│   │   └── __tests__/
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── type.ts
│   │   ├── handlers/
│   │   └── __tests__/
│   └── um-page/
│       └── UmPage.tsx
├── services/
│   ├── auth-service.ts
│   ├── balance-service.ts
│   ├── socket-service.ts
│   ├── enhanced-logger.ts
│   └── __tests__/
├── __tests__/
│   └── integration/
└── page.tsx
```

## 🚀 Key Components

### 1. SplashScreen Component

**Location**: `src/components/splash-screen/SplashScreen.tsx`

**Features**:

-   SSO authentication with token validation
-   Language loading and configuration
-   Resource preloading with progress tracking
-   Game configuration and initialization
-   User Management (UM) handling
-   Comprehensive logging

**Key Methods**:

-   `authenticateWithSSO()` - Handles SSO authentication
-   `loadLanguage()` - Loads and configures language
-   `initializeHandler()` - Main initialization flow
-   `handlePreloadProgress()` - Tracks resource loading progress

### 2. Dashboard Component

**Location**: `src/components/dashboard/Dashboard.tsx`

**Features**:

-   Game container management
-   Balance display and updates
-   User context management
-   Event handling and lifecycle management
-   Integration with shared services

**Key Methods**:

-   `updateUserBalance()` - Manages balance updates
-   `openGame()` - Handles game opening
-   `onVisibilityChange()` - Page visibility management
-   `renderGames()` - Renders game components

### 3. Auth Service

**Location**: `src/services/auth-service.ts`

**Features**:

-   SSO authentication integration
-   Session management and verification
-   Authorization handling
-   Balance retrieval
-   State management with callbacks

**Key Methods**:

-   `authenticateWithSSO()` - SSO authentication
-   `verifySession()` - Session verification
-   `authorize()` - User authorization
-   `getBalance()` - Balance retrieval
-   `subscribeToAuthState()` - State subscription

### 4. Balance Service

**Location**: `src/services/balance-service.ts`

**Features**:

-   Real-time balance management
-   Bet amount deduction
-   Winnings addition
-   Balance refresh functionality
-   Subscription-based updates

**Key Methods**:

-   `getBalance()` - Retrieve current balance
-   `updateBalance()` - Update balance with notifications
-   `deductBetAmount()` - Deduct bet amounts
-   `addWinnings()` - Add winnings
-   `subscribeToBalanceUpdates()` - Balance update subscriptions

### 5. Socket Service

**Location**: `src/services/socket-service.ts`

**Features**:

-   Real-time socket communication
-   Game message handling
-   Connection management
-   Event emission and listening
-   Error handling and reconnection

**Key Methods**:

-   `connect()` - Establish socket connection
-   `disconnect()` - Close socket connection
-   `emit()` - Send messages
-   `on()` / `off()` - Event listener management
-   `isConnected()` - Connection status check

### 6. Enhanced Logger

**Location**: `src/services/enhanced-logger.ts`

**Features**:

-   Multi-level logging (DEBUG, INFO, WARN, ERROR)
-   Console, storage, and remote logging
-   Session and user tracking
-   Performance monitoring
-   Log export and download
-   Game-specific logging methods

**Key Methods**:

-   `debug()` / `info()` / `warn()` / `error()` - Logging methods
-   `logGameEvent()` - Game-specific logging
-   `logBettingEvent()` - Betting-specific logging
-   `startTimer()` - Performance timing
-   `exportLogs()` - Log export functionality

## 🧪 Testing Strategy

### Test Coverage

The implementation includes comprehensive test coverage following the AAA (Arrange, Act, Assert) pattern:

1. **Unit Tests**: Individual component and service testing
2. **Integration Tests**: End-to-end flow testing
3. **Error Handling Tests**: Edge cases and error scenarios
4. **Performance Tests**: State management and subscription handling

### Test Files

-   `src/services/__tests__/auth-service.test.ts` - Auth service tests
-   `src/services/__tests__/balance-service.test.ts` - Balance service tests
-   `src/services/__tests__/socket-service.test.ts` - Socket service tests
-   `src/components/splash-screen/__tests__/SplashScreen.test.tsx` - SplashScreen tests
-   `src/components/dashboard/__tests__/Dashboard.test.tsx` - Dashboard tests
-   `src/__tests__/integration/plinko-flow.test.tsx` - Integration tests

### Test Categories

1. **Happy Path Tests**: Normal operation scenarios
2. **Edge Case Tests**: Boundary conditions and limits
3. **Error Handling Tests**: Failure scenarios and recovery
4. **Integration Tests**: Component interaction testing
5. **Performance Tests**: State management and subscription handling

## 🔧 Configuration

### Environment Variables

```bash
NEXT_PUBLIC_DEFAULT_GAME_ID=145  # Plinko game ID
NEXT_PUBLIC_BASE_PATH=           # Base path for deployment
PORT=3003                        # Development port
```

### Logger Configuration

```typescript
const loggerConfig = {
    enableConsole: true,
    enableStorage: true,
    enableRemote: false,
    maxStorageEntries: 1000,
    logLevel: LogLevel.INFO,
};
```

## 🚀 Usage Examples

### Basic Authentication Flow

```typescript
import { getPlinkoAuthService } from "./services/auth-service";

const authService = getPlinkoAuthService();

// Authenticate user
const session = await authService.authenticateWithSSO(token, 10);

// Authorize user
const authResponse = await authService.authorize();

// Get balance
const balance = await authService.getBalance();
```

### Balance Management

```typescript
import { getPlinkoBalanceService } from "./services/balance-service";

const balanceService = getPlinkoBalanceService(session);

// Subscribe to balance updates
const unsubscribe = balanceService.subscribeToBalanceUpdates((balance) => {
    console.log("New balance:", balance);
});

// Place bet
const canBet = await balanceService.deductBetAmount(100);

// Add winnings
await balanceService.addWinnings(200);
```

### Socket Communication

```typescript
import { PlinkoSocketService } from "./services/socket-service";

const socketService = new PlinkoSocketService(gameMessageHandler, session, "Plinko", socketInfo);

// Connect to socket
socketService.connect();

// Send message
socketService.emit("placeBet", { amount: 100, gameMode: 0 });

// Listen for events
socketService.on("betResult", (result) => {
    console.log("Bet result:", result);
});
```

### Enhanced Logging

```typescript
import { enhancedLogger } from "./services/enhanced-logger";

// Set user context
enhancedLogger.setUserId("user123");

// Log game events
enhancedLogger.logGameEvent("Ball dropped", { multiplier: 2.5 });

// Log betting events
enhancedLogger.logBettingEvent("Bet placed", { amount: 100, choice: "odd" });

// Performance timing
const endTimer = enhancedLogger.startTimer("Game initialization");
// ... do work ...
endTimer();

// Export logs
enhancedLogger.downloadLogs("plinko_session_logs.json");
```

## 🔍 Monitoring and Debugging

### Log Analysis

The enhanced logger provides comprehensive logging capabilities:

1. **Console Logging**: Real-time debugging in browser console
2. **Storage Logging**: Persistent logs in localStorage
3. **Remote Logging**: Optional remote log collection
4. **Log Export**: Download logs for analysis

### Performance Monitoring

```typescript
// Start performance timer
const endTimer = enhancedLogger.startTimer("Game initialization");

// ... perform operations ...

// End timer and log duration
endTimer();
```

### Error Tracking

```typescript
try {
    // ... risky operation ...
} catch (error) {
    enhancedLogger.trackError(error, { context: "additional info" });
}
```

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build:standalone
npm start
```

### Docker Deployment

```bash
docker build -t plinko-microsite .
docker run -p 3003:3003 plinko-microsite
```

## 📊 Performance Metrics

### Key Performance Indicators

1. **Authentication Time**: < 500ms
2. **Resource Loading**: Progressive loading with progress tracking
3. **Balance Updates**: Real-time with < 100ms latency
4. **Socket Connection**: < 200ms establishment time
5. **Component Rendering**: < 50ms for dashboard

### Optimization Features

1. **Lazy Loading**: Dynamic imports for components
2. **Memoization**: React.memo for performance optimization
3. **Subscription Management**: Efficient state updates
4. **Error Boundaries**: Graceful error handling
5. **Resource Preloading**: Optimized asset loading

## 🔒 Security Considerations

1. **Token Validation**: Secure SSO token handling
2. **Session Management**: Secure session storage and validation
3. **Balance Security**: Server-side balance validation
4. **Socket Security**: Secure WebSocket connections
5. **Error Handling**: No sensitive data in error logs

## 🎯 Future Enhancements

1. **Real-time Analytics**: Enhanced user behavior tracking
2. **A/B Testing**: Feature flag implementation
3. **Performance Monitoring**: Advanced performance metrics
4. **Error Reporting**: Automated error reporting system
5. **Mobile Optimization**: Enhanced mobile experience

## 📝 Conclusion

The Plinko microsite implementation provides a robust, scalable, and maintainable solution for the Plinko game with comprehensive authentication, balance management, real-time communication, and logging capabilities. The modular architecture ensures easy maintenance and future enhancements while the comprehensive testing strategy guarantees reliability and performance.

The implementation follows best practices for React development, includes comprehensive error handling, and provides extensive logging and monitoring capabilities for production deployment.
