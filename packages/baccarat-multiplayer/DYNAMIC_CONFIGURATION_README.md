# Dynamic Game Configuration

This document explains how to use the dynamic configuration system for building and deploying different games (like SeDie Multiplayer and future games like Baccarat) without hardcoding values.

## Overview

The system now supports dynamic configuration of:

-   Game ID (`NEXT_PUBLIC_DEFAULT_GAME_ID`)
-   Base Path (`NEXT_PUBLIC_BASE_PATH`)
-   Game-specific behaviors (bet payload format, client seed requirements, direct access permissions)

## Quick Start

### For Development

```bash
# Set environment variables
export NEXT_PUBLIC_DEFAULT_GAME_ID=150
export NEXT_PUBLIC_BASE_PATH=/game-150

# Run development server
npm run dev:dynamic
```

### For Production Build

```bash
# Set environment variables
export NEXT_PUBLIC_DEFAULT_GAME_ID=150
export NEXT_PUBLIC_BASE_PATH=/game-150

# Build the application
npm run build:dynamic
```

### For Docker

```bash
# Build Docker image with custom configuration
docker build \
  --build-arg NEXT_PUBLIC_DEFAULT_GAME_ID=150 \
  --build-arg NEXT_PUBLIC_BASE_PATH=/game-150 \
  -t my-game-app .
```

## Environment Variables

| Variable                      | Description                       | Default     | Example     |
| ----------------------------- | --------------------------------- | ----------- | ----------- |
| `NEXT_PUBLIC_DEFAULT_GAME_ID` | The game ID to use                | `150`       | `150`       |
| `NEXT_PUBLIC_BASE_PATH`       | The base path for the application | `/game-150` | `/game-150` |

## Game Configuration

Game-specific behaviors are configured in the existing game registry system at `packages/shared/src/game-registry/`. To add a new game:

1. **Update game registration** (e.g., in `packages/baccarat-multiplayer/src/game-registry.ts`):

```typescript
registerGame({
    gameId: 150,
    loader: () => import("./baccarat-page"),
    metadata: {
        name: "Baccarat",
        version: "1.0.0",
        description: "Baccarat game component",
    },
    config: {
        betPayloadFormat: "map",
        requiresClientSeedForBet: false,
        allowDirectAccess: false,
    },
});
```

### Configuration Properties

-   `gameId`: Unique identifier for the game
-   `name`: Display name of the game
-   `betPayloadFormat`: `'single'` or `'map'` - determines how bet data is formatted
-   `requiresClientSeedForBet`: Whether to attach client seed to bet events
-   `allowDirectAccess`: Whether users can access the game directly without it being in their offer games

## Build Scripts

### Original Scripts (with hardcoded values)

-   `npm run dev:standalone` - Development with game ID 150 and base path /game-150
-   `npm run build:standalone` - Production build with base path /game-150
-   `npm run start:standalone` - Start production server with game ID 150 and base path /game-150

### New Dynamic Scripts

-   `npm run dev:dynamic` - Development with environment-configurable values
-   `npm run build:dynamic` - Production build with environment-configurable values

## Docker Configuration

The Dockerfile now accepts build arguments:

```dockerfile
# Build with custom game configuration
ARG NEXT_PUBLIC_DEFAULT_GAME_ID=150
ARG NEXT_PUBLIC_BASE_PATH=/game-150
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_DEFAULT_GAME_ID=$NEXT_PUBLIC_DEFAULT_GAME_ID
```

## Testing

Run the test script to verify configuration works:

```bash
node test-dynamic-config.js
```

## Adding New Games

1. **Update Game Settings**: Add configuration to `game-settings.json`
2. **Update Game Config**: Add entry to `GAME_CONFIGS` in `game-config.ts`
3. **Set Environment Variables**: Configure build with appropriate game ID and base path
4. **Build and Deploy**: Use dynamic build scripts or Docker with custom args

## Example: Adding Baccarat (Game ID 150)

```bash
# 1. Set environment
export NEXT_PUBLIC_DEFAULT_GAME_ID=150
export NEXT_PUBLIC_BASE_PATH=/game-150

# 2. Add to game-settings.json
{
    "150": {
        "id": 150,
        "gameName": "Baccarat",
        "gamePath": "baccarat",
        // ... other settings
    }
}

# 3. Add to game-config.ts
150: {
    gameId: 150,
    name: 'Baccarat',
    betPayloadFormat: 'map',
    requiresClientSeedForBet: false,
    allowDirectAccess: false,
},

# 4. Build
npm run build:dynamic

# 5. Deploy with Docker
docker build \
  --build-arg NEXT_PUBLIC_DEFAULT_GAME_ID=150 \
  --build-arg NEXT_PUBLIC_BASE_PATH=/game-150 \
  -t baccarat-app .
```

## Migration Guide

### From Hardcoded to Dynamic

**Before:**

```bash
npm run build:standalone  # Always builds for game 150
```

**After:**

```bash
# For same game (150)
npm run build:standalone

# For new game (if needed)
export NEXT_PUBLIC_DEFAULT_GAME_ID=151
export NEXT_PUBLIC_BASE_PATH=/game-151
npm run build:dynamic
```

### Docker Migration

**Before:**

```dockerfile
CMD ["sh", "-c", "NEXT_PUBLIC_DEFAULT_GAME_ID=150 NEXT_PUBLIC_BASE_PATH=/game-150 PORT=5001 node custom-server.js"]
```

**After:**

```dockerfile
ARG NEXT_PUBLIC_DEFAULT_GAME_ID=150
ARG NEXT_PUBLIC_BASE_PATH=/game-150
ENV NEXT_PUBLIC_DEFAULT_GAME_ID=$NEXT_PUBLIC_DEFAULT_GAME_ID
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

CMD ["sh", "-c", "PORT=5001 node custom-server.js"]
```

## Troubleshooting

### SCSS Variables Not Working

-   Ensure `NEXT_PUBLIC_BASE_PATH` is set before building
-   Check that `next.config.js` has the correct `prependData` configuration
-   Verify the SCSS imports the `_base-path.scss` file

### Game Configuration Not Applied

-   Check that the game ID exists in `GAME_CONFIGS`
-   Verify the utility functions are imported correctly
-   Ensure the game ID is a number, not a string

### Docker Build Issues

-   Make sure ARG values are passed correctly: `--build-arg NEXT_PUBLIC_DEFAULT_GAME_ID=150`
-   Check that ENV variables are set in the correct stage
-   Verify the CMD doesn't override environment variables

## Files Modified

-   `packages/baccarat-multiplayer/Dockerfile` - Added ARG support
-   `packages/baccarat-multiplayer/next.config.js` - Dynamic SCSS injection
-   `packages/shared/src/styles/constants/_base-path.scss` - Removed hardcoded value
-   `packages/shared/src/game-registry/` - Extended existing registry with behavior configurations
-   `packages/baccarat-multiplayer/package.json` - Added dynamic scripts
-   Various component files - Updated to use dynamic configuration
