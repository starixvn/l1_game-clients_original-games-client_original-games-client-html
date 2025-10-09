# Plinko Game Logging System

A comprehensive logging system for the Plinko game that allows downloading logs as text files for debugging and monitoring.

## Features

- **Multiple log levels**: `info`, `warn`, `error`, `debug`
- **Structured data logging**: Log objects and complex data alongside messages
- **Memory-efficient**: Prevents memory overflow with configurable log limits
- **Download functionality**: Export logs as downloadable text files
- **Console integration**: All logs appear in browser console for immediate feedback
- **UI controls**: Download and clear logs directly from the interface

## Usage

### Basic Logging

```typescript
import { logger } from '../services/logger';

// Simple message logging
logger.info('Game started');
logger.warn('Low balance warning');
logger.error('Connection failed');

// Logging with structured data
logger.info('Bet placed', {
  amount: 100,
  gameMode: 'Lightning',
  rows: 9,
  timestamp: new Date().toISOString()
});
```

### Download Logs

```typescript
// Download logs as text file
logger.downloadLogs(); // Uses default filename
logger.downloadLogs('custom-logs.txt'); // Custom filename
```

### Clear Logs

```typescript
// Clear all stored logs
logger.clear();
```

### Get Log Count

```typescript
const count = logger.getLogCount();
console.log(`Total logs: ${count}`);
```

## UI Components

The `LoggerControls` component provides an interactive logging interface:

```tsx
import LoggerControls from '../components/LoggerControls';

function MyComponent() {
  return (
    <div>
      <LoggerControls className="mb-4" />
      {/* Other components */}
    </div>
  );
}
```

### Features

- **Expandable Interface**: Click to expand/collapse for viewing recent logs
- **Live Log Count**: Shows current number of stored log entries
- **Download Button**: Downloads all logs as a timestamped text file
- **Clear Button**: Removes all stored logs
- **Recent Logs Viewer**: Shows last 10 log entries in monospace font
- **Auto-Update**: Log count and recent logs update every 5 seconds
- **Status Indicator**: Green pulsing dot shows logger is active
- **Responsive Design**: Adapts to different screen sizes

## Log Format

Logs are formatted with timestamps and structured data:

```
[2025-09-27T17:04:43.864Z] [INFO] Game started
[2025-09-27T17:04:43.878Z] [INFO] Bet placed | {"amount":100,"gameMode":"Lightning","rows":9}
[2025-09-27T17:04:43.879Z] [WARN] Low balance | {"balance":50,"required":100}
```

## Configuration

The logger has a default configuration:

- **Max logs**: 10,000 entries (prevents memory overflow)
- **Auto-cleanup**: Oldest logs are removed when limit is reached

## Implementation Details

- **Memory storage**: Logs are stored in memory for immediate access
- **Browser compatibility**: Uses Blob API for file downloads
- **TypeScript support**: Fully typed for better development experience
- **Singleton pattern**: Single logger instance across the application

## Current Logging Points

The logger is currently integrated at these key points:

1. **Tab switching**: Logs when switching between Manual and Auto tabs
2. **Configuration restoration**: Logs when tab configurations are restored
3. **Manual bets**: Logs bet placement with details
4. **Auto bet operations**: Logs start/stop/validation of auto betting
5. **Bet results**: Logs received bet results from the service
6. **Connection status**: Logs connection and authentication issues

### Stylesheet Logging

Comprehensive stylesheet logging has been added to capture computed styles for all major UI components:

**Main Components:**
- **GameBackground**: Main background container styles
- **GameInfo**: Game name and RTP display styles
- **MultiplierDisplay**: Multiplier slots display styles
- **BetsTable**: Player bets table styles
- **BetControls**: Main bet controls container styles
- **CanvasBallLayout**: Ball physics canvas container styles

**Bet Control Components:**
- **BetAmountInput**: Bet amount input field styles
- **GameModeSelector**: Game mode selection styles
- **RowsSelector**: Row count selector styles
- **OnWinControls**: Win condition controls styles
- **OnLossControls**: Loss condition controls styles

**Logged Properties:**
Each component logs comprehensive stylesheet information including:
- Width, height, position, display
- Padding, margin, border
- CSS class names
- Component-specific styling properties

This enables detailed debugging of layout and styling issues across all UI components.

## File Structure

```
services/
  └── logger.ts              # Main logger implementation

components/
  └── LoggerControls.tsx     # UI controls for log management

pages/
  └── index.tsx              # Integrated logging throughout the app
```

## Example Downloaded Log File

```
Plinko Game Console Logs
Generated: 9/27/2025, 5:04:43 PM
Total Logs: 15

[2025-09-27T17:04:43.864Z] [INFO] Logger initialized
[2025-09-27T17:04:43.878Z] [INFO] Switching to Manual tab | {"previousTab":"Auto","newTab":"Manual"}
[2025-09-27T17:04:43.879Z] [INFO] Placing manual bet | {"betAmount":100,"gameMode":"Lightning","balance":10000}
...
```

## Future Enhancements

- **Log filtering**: Filter logs by level or content
- **Log persistence**: Save logs to localStorage or IndexedDB
- **Remote logging**: Send logs to external monitoring services
- **Log search**: Search through logs in the UI
- **Log export formats**: JSON, CSV export options
