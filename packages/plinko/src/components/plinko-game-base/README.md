# Plinko Game Base

This directory contains the Plinko-specific game base that extends the shared GameBase from `@shared/components/game-base/`.

## Overview

The `PlinkoGameBase` extends the shared `GameBase` class and provides Plinko-specific implementations for:

-   Game state management
-   Round data handling
-   Sound management
-   Socket connection initialization
-   UI rendering

## Structure

```
plinko-game-base/
├── index.tsx                 # Main PlinkoGameBase class
├── handlers/                 # Plinko-specific handlers
│   ├── index.ts             # Handler exports
│   ├── plinko-state-handler.ts
│   ├── plinko-game-round-data-handler.ts
│   └── plinko-game-sound-handler.ts
└── README.md                # This file
```

## Key Differences from Round-Based Games

Unlike round-based games like sedie-multiplayer, Plinko:

-   Doesn't use traditional round states (betting windows, result display, etc.)
-   Is continuously playable
-   Has its own internal game logic within the `PlinkoGame` component
-   Uses socket connections for real-time ball drops and results

## Handlers

### PlinkoStateHandler

-   Always returns `RoundState.InRound` since Plinko is continuously active
-   Manages Plinko-specific game state logic

### PlinkoGameRoundDataHandler

-   Extends the shared `GameRoundDataHandler`
-   Can be extended for Plinko-specific data handling

### PlinkoGameSoundHandler

-   Extends the shared `RoundGameSoundHandler`
-   Adapts sound management for Plinko's continuous gameplay

## Usage

The `PlinkoGameBase` is exported from `packages/plinko/src/page.tsx` and is used by the shared game routing system through `games/games.tsx`.

## Integration with Shared System

The PlinkoGameBase integrates with the shared system by:

1. Using shared authentication and session management
2. Leveraging shared UI components (Header, Menu, Background)
3. Following the GameBase interface for consistency
4. Maintaining socket connection for real-time gameplay
