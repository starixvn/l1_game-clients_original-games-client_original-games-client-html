# OpenReplay Tracker Component

This component provides OpenReplay session replay and user behavior tracking functionality for the application.

## Features

-   **Session Replay**: Records user interactions and screen activity
-   **User Identification**: Associates sessions with specific users
-   **Metadata Tracking**: Adds custom metadata to sessions
-   **Error Handling**: Graceful fallback if OpenReplay fails to initialize
-   **TypeScript Support**: Full type safety and IntelliSense support
-   **DRY Architecture**: React hook reuses utility functions to avoid code duplication
-   **Flexible Usage**: Both React hooks and utility functions for different contexts
-   **Next.js Compatible**: Works with Next.js applications using dynamic imports

## Usage

### 1. Basic Component Usage

```tsx
import { OpenReplayTracker } from "@shared/components/page-components/open-replay";

function App() {
    return (
        <div>
            <OpenReplayTracker />
            {/* Your app content */}
        </div>
    );
}
```

### 2. Utility Functions (Non-React Usage)

```tsx
import { setOpenReplayUserID, trackOpenReplayEvent, isOpenReplayAvailable } from "@shared/components/page-components/open-replay";

// In a service or utility function
export function authService() {
    if (isOpenReplayAvailable()) {
        setOpenReplayUserID("user@example.com");
        trackOpenReplayEvent("user_authenticated", {
            timestamp: Date.now(),
        });
    }
}
```

### 3. Global Access (Legacy)

The tracker is also available globally via `window.openreplay`:

```tsx
// Access the tracker from anywhere in your app
const tracker = window.openreplay;

if (tracker) {
    // Set user ID
    tracker.setUserID("user@example.com");

    // Add metadata
    tracker.setMetadata("user_role", "admin");

    // Track custom events
    tracker.event("button_clicked", { buttonId: "submit" });

    // Track issues
    tracker.issue("api_error", { error: "Network timeout" });
}
```

## Configuration

The tracker is configured with the following settings:

-   **Project Key**: `G23SscSi4ivPFNNnyhVm` (or from configuration)
-   **Secure Mode**: Disabled for localhost development
-   **Input Mode**: 2 (specific input handling mode)
-   **Text Obscuring**: Numbers are not obscured, emails are obscured

### Project Key Validation

The OpenReplay component will **not load** if:

-   `projectKey` is `undefined`
-   `projectKey` is `null`
-   `projectKey` is an empty string (`""`)
-   `projectKey` contains only whitespace

**OpenReplay is enabled when `projectKey` has data, and disabled when it doesn't.** There is no separate `enabled` property - the presence of a valid project key determines whether tracking is active.

### Testing Different Configurations

You can test the behavior by modifying the configuration:

```javascript
// This will NOT load OpenReplay
window.envConfig = {
    openreplay: {
        projectKey: "", // Empty string
    },
};

// This will NOT load OpenReplay
window.envConfig = {
    openreplay: {
        projectKey: undefined, // Undefined
    },
};

// This will load OpenReplay
window.envConfig = {
    openreplay: {
        projectKey: "VALID_PROJECT_KEY",
    },
};
```

## API Methods

### React Hook API (`useOpenReplay`)

| Method/Property            | Description                 | Parameters                                | Returns          |
| -------------------------- | --------------------------- | ----------------------------------------- | ---------------- |
| `setUserID(id)`            | Associate session with user | `id: string`                              | `void`           |
| `setUserAnonymousID(id)`   | Set anonymous user ID       | `id: string`                              | `void`           |
| `setMetadata(key, value)`  | Add custom metadata         | `key: string, value: any`                 | `void`           |
| `setMultipleMetadata(obj)` | Set multiple metadata       | `obj: Record<string, any>`                | `void`           |
| `trackEvent(key, payload)` | Track custom event          | `key: string, payload?: any, issue?: any` | `void`           |
| `trackIssue(key, payload)` | Track issue/error           | `key: string, payload?: any`              | `void`           |
| `isActive`                 | Check if tracker is active  | -                                         | `boolean`        |
| `sessionToken`             | Get current session token   | -                                         | `string \| null` |
| `isTrackerAvailable`       | Check if tracker is ready   | -                                         | `boolean`        |

### Utility Functions API

| Function                             | Description                 | Parameters                                | Returns          |
| ------------------------------------ | --------------------------- | ----------------------------------------- | ---------------- |
| `setOpenReplayUserID(id)`            | Associate session with user | `id: string`                              | `boolean`        |
| `setOpenReplayAnonymousID(id)`       | Set anonymous user ID       | `id: string`                              | `boolean`        |
| `setOpenReplayMetadata(key, value)`  | Add custom metadata         | `key: string, value: any`                 | `boolean`        |
| `setOpenReplayMultipleMetadata(obj)` | Set multiple metadata       | `obj: Record<string, any>`                | `boolean`        |
| `trackOpenReplayEvent(key, payload)` | Track custom event          | `key: string, payload?: any, issue?: any` | `boolean`        |
| `trackOpenReplayIssue(key, payload)` | Track issue/error           | `key: string, payload?: any`              | `boolean`        |
| `isOpenReplayActive()`               | Check if tracker is active  | -                                         | `boolean`        |
| `getOpenReplaySessionToken()`        | Get current session token   | -                                         | `string \| null` |
| `isOpenReplayAvailable()`            | Check if tracker is ready   | -                                         | `boolean`        |
| `clearOpenReplayRetryIntervals()`    | Clear all retry intervals   | -                                         | `void`           |
| `clearOpenReplayRetryInterval(id)`   | Clear specific retry        | `id: string`                              | `void`           |

### Retry Mechanism

The `setOpenReplayUserID` function includes an automatic retry mechanism with clean, modular implementation:

-   **Retry Interval**: Every 5 seconds
-   **Max Retries**: 60 attempts (5 minutes total)
-   **Auto Cleanup**: Intervals are automatically cleared when successful or max retries reached
-   **Duplicate Prevention**: Calling `setOpenReplayUserID` with the same user ID will clear any existing retry interval
-   **Modular Design**: Clean separation of concerns with dedicated helper functions

```typescript
// This will retry every 5s until tracker is available
setOpenReplayUserID("user@example.com");

// Manual cleanup if needed
clearOpenReplayRetryIntervals(); // Clear all retry intervals
clearOpenReplayRetryInterval("user@example.com"); // Clear specific user
```

## Error Handling

The component includes comprehensive error handling:

-   Initialization errors are caught and logged
-   Start failures are handled gracefully
-   User data setting errors are logged but don't break the app
-   Cleanup errors are caught during component unmount

## Development vs Production

-   **Development**: Secure mode is disabled for localhost testing
-   **Production**: Update the configuration to enable secure mode and use production project key

## Dependencies

-   `@openreplay/tracker`: ^16.4.9
-   `react`: ^18.2.0

## TypeScript Support

The component includes TypeScript definitions for:

-   Configuration options
-   Global window interface
-   Tracker methods and properties

## Architecture

The OpenReplay integration follows a **simple architecture**:

1. **Core Utilities** (`openreplay-utils.ts`): Pure functions for OpenReplay operations
2. **Component** (`index.tsx`): Initializes the tracker and exports everything
3. **Types** (`types.ts`): TypeScript definitions for type safety

### Benefits of This Architecture

-   **Simplicity**: Clean, focused code without unnecessary abstractions
-   **Testability**: Utilities can be tested independently
-   **Flexibility**: Can use utilities in any context (React or non-React)
-   **Maintainability**: Changes to OpenReplay logic only need to be made in one place

## Notes

-   The component renders nothing (`return null`) - it only initializes tracking
-   The tracker is initialized once and reused across the app
-   User ID is set to "ricky@demo.com" by default (update as needed)
-   Metadata includes `user_type: 'demo_user'` by default
-   All OpenReplay operations are handled through utility functions
