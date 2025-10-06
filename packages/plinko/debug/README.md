# Debug Tools

This folder contains debugging tools for the Plinko game. These tools are primarily for development and troubleshooting.

## Available Debug Tools

### debug-ball-spawning.html

A simple HTML page to test ball spawning functionality directly in the browser.

### debug-logging.html

An HTML page to control and view Plinko game logs in real-time.

## Usage

1. Start your Plinko application in development mode
2. Open the desired debug HTML file in a separate browser tab
3. Use the controls to interact with the running game

## Important Notes

-   These tools are for development only and should not be included in production builds
-   They provide access to internal game state and logging systems
-   Use browser developer tools (F12) to see console output alongside these debug pages

## Global Debug Access

When the game is running, you can access debug tools via browser console:

```javascript
// Access the component reference
window.plinkoComponentRef;

// Access the diagnostic tool
window.plinkoDiagnostic;

// Access the logger
window.plinkoLogger;
```

## Example Debug Commands

```javascript
// Check component status
window.plinkoDiagnostic.checkComponentRef(window.plinkoComponentRef);

// Test ball spawning
window.plinkoDiagnostic.testBallSpawning(window.plinkoComponentRef);

// Run full diagnostic
window.plinkoDiagnostic.runFullDiagnostic(window.plinkoComponentRef);

// View logs
window.plinkoLogger.getLogs();

// Download logs
window.plinkoLogger.downloadLogs();
```
