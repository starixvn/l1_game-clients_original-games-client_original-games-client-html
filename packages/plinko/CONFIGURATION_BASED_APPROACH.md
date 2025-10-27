# Configuration-Based Plinko Games

This document explains the configuration-based approach implemented for supporting both Plinko (Game ID 145) and Plinko X (Game ID 159) games using a single codebase.

## Overview

The implementation follows Solution 3: Configuration-Based Approach, where a single codebase supports multiple games through runtime configuration, eliminating code duplication while maintaining the ability to customize individual games.

## Key Features

-   **Single Codebase**: Both Plinko and Plinko X share the same business logic and components
-   **Runtime Configuration**: Game behavior is determined by configuration files and runtime game ID
-   **Game-Specific Assets**: Assets, multipliers, and UI themes can be customized per game
-   **Easy Extension**: Adding new games requires only configuration changes

## Architecture

### Configuration Files

1. **`game-settings.json`**: Contains game metadata, socket configuration, and durations
2. **`src/game-configurations/`**: Directory containing game-specific configurations:
    - `assets.ts`: Asset paths and sound files
    - `multipliers.ts`: Multiplier values and colors for different difficulty modes
    - `ui-themes.ts`: UI colors and styling themes

### Core Components

1. **`src/game-config.ts`**: Runtime game configuration factory
2. **`src/game-registry.ts`**: Game registration system supporting multiple games
3. **`src/page.tsx`**: Dynamic page component that initializes game config
4. **`src/constants.ts`**: Dynamic constants based on current game

## Usage

### Development

```bash
# Run Plinko (Game ID 145)
npm run dev:plinko

# Run Plinko X (Game ID 159)
npm run dev:plinko-x

# Run with custom game ID
NEXT_PUBLIC_DEFAULT_GAME_ID=159 npm run dev
```

### Building

```bash
# Build Plinko
npm run build:plinko

# Build Plinko X
npm run build:plinko-x

# Build with custom game ID
NEXT_PUBLIC_DEFAULT_GAME_ID=159 npm run build:standalone
```

### Docker Deployment

```bash
# Build Docker images
npm run docker:build:plinko      # Build Plinko image
npm run docker:build:plinko-x    # Build Plinko X image

# Run Docker containers
npm run docker:run:plinko        # Run Plinko on port 5000
npm run docker:run:plinko-x      # Run Plinko X on port 5001

# Manual Docker commands
docker build -f Dockerfile -t plinko:latest .
docker build -f Dockerfile.plinko-x -t plinko-x:latest .
docker run -p 5000:5000 plinko:latest
docker run -p 5001:5000 plinko-x:latest
```

### Local Development with Proxy

For local development that simulates the production deployment environment with game-specific subpaths:

```bash
# From root directory - start Plinko with proxy (simulates /game-145/)
npm run dev:proxy-plinko
# Access: http://localhost:3002/game-145/

# From root directory - start Plinko X with proxy (simulates /game-159/)
npm run dev:proxy-plinko-x
# Access: http://localhost:3003/game-159/

# Compare with existing games:
npm run dev:proxy-sedie-multiplayer    # http://localhost:3000/game-148/
npm run dev:proxy-baccarat-multiplayer # http://localhost:3001/game-150/
```

**What the proxy commands do:**

1. Start the game server on its assigned port (5003 for Plinko, 5004 for Plinko X)
2. Start a reverse proxy that strips the game prefix and forwards requests
3. Simulate production URLs like `l2-original-games-client1.lumigame.com/game-159/`

**Port assignments:**

-   Plinko: Game server (5003) + Proxy (3002) → `http://localhost:3002/game-145/`
-   Plinko X: Game server (5004) + Proxy (3003) → `http://localhost:3003/game-159/`

### Dynamic Scripts

The package includes dynamic scripts that read from environment variables:

```bash
# Development with environment variables
NEXT_PUBLIC_DEFAULT_GAME_ID=159 npm run dev:dynamic

# Build with environment variables
NEXT_PUBLIC_DEFAULT_GAME_ID=159 npm run build:dynamic
```

## Game Configuration

### Adding a New Game

To add a new game variant:

1. **Add to `game-settings.json`**:

```json
"200": {
    "id": 200,
    "gameName": "Plinko Pro",
    "tolgeeNamespace": "PlinkoPro",
    "socketInfo": {
        "namespace": "plinko-pro",
        "path": "plinko-pro"
    },
    // ... other settings
}
```

2. **Update configuration files**:

    - Add assets configuration in `assets.ts`
    - Add multiplier configuration in `multipliers.ts`
    - Add UI theme in `ui-themes.ts`

3. **Update game-config.ts**:

    - Add case in `initializeGameConfig()` function

4. **Add build scripts** in `package.json`:

```json
"dev:plinko-pro": "cross-env NEXT_PUBLIC_DEFAULT_GAME_ID=200 npm run dev",
"build:plinko-pro": "cross-env NEXT_PUBLIC_DEFAULT_GAME_ID=200 npm run build:standalone"
```

5. **Create Dockerfile** (if deploying separately):
    - Copy `Dockerfile.plinko-x` and update game ID and paths
    - Add Docker build scripts to `package.json`

### Runtime Game ID Detection (Priority System)

The application uses a sophisticated priority system to determine which game to load, supporting both dedicated servers and multi-game deployments:

#### **Priority Order (Highest to Lowest):**

1. **Environment Variable** (Dedicated Servers)

    - `NEXT_PUBLIC_DEFAULT_GAME_ID` environment variable
    - Used for dedicated game servers (e.g., Plinko X server always serves game ID 159)
    - Example: `NEXT_PUBLIC_DEFAULT_GAME_ID=159` in Docker
    - **Always takes priority** for dedicated deployments

2. **URL Path Extraction** (Multi-Game Servers)

    - Extracts game ID from URL patterns like `/game-159` → game ID 159
    - Used for multi-game deployments where one server serves multiple games
    - Example: `/game-145` loads Plinko, `/game-159` loads Plinko X
    - **Takes priority** when no environment variable is set

3. **URL Query Parameter** (External Systems)

    - Reads `gameId` from URL query parameters (e.g., `?gameId=145`)
    - Used as fallback for external systems that pass game ID via query params
    - **Only used** when neither environment variable nor URL path provide game ID

4. **Default Fallback** (Lowest Priority)
    - Defaults to game ID 148 (SeDie) if no other method applies

#### **Implementation Details:**

**Server-Side Rendering**: Game ID is extracted during SSR using `getInitialProps`
**Client-Side Navigation**: Game ID is extracted from the router path with `useEffect`
**Splash Screen Logic**: Handles all priority detection and passes correct game ID to dashboard
**Game Component**: Provides additional client-side validation and URL path detection

### Build-Time Configuration

While the application can now detect games dynamically from URLs, you can still build specific versions using environment variables for optimization:

```bash
# Build Plinko-specific version
NEXT_PUBLIC_DEFAULT_GAME_ID=145 npm run build:standalone

# Build Plinko X-specific version
NEXT_PUBLIC_DEFAULT_GAME_ID=159 npm run build:standalone
```

### Game Availability Validation

The shared splash-screen component validates game availability using a whitelist of known game IDs:

```typescript
const knownGameIds = [145, 148, 159, 150]; // Plinko, SeDie Multiplayer, Plinko X, Baccarat
```

Games in this list bypass lobby/offer validation and can be deep-linked directly. Add new game IDs to this array when deploying new games.

## Current Game Differences

### Plinko (ID 145)

-   Orange color theme
-   Standard multiplier values
-   Default UI styling

### Plinko X (ID 159)

-   Blue/purple color theme
-   Currently uses same assets and multipliers as Plinko
-   Different namespace and socket configuration

## Benefits

1. **Zero Code Duplication**: Single codebase for multiple games
2. **Easy Maintenance**: Updates apply to all games simultaneously
3. **Flexible Customization**: Each game can have unique assets and themes
4. **Scalable**: Adding new games requires minimal changes
5. **Performance**: No runtime overhead from unused code paths

## Technical Implementation

### Runtime Configuration

The system uses a factory pattern where game configuration is initialized at runtime:

```typescript
// Initialize game configuration
initializeGameConfig(gameId);

// Access game-specific configurations
const assets = getCurrentGameAssets();
const multipliers = getCurrentGameMultipliers();
const theme = getCurrentGameUITheme();
```

### Dynamic Imports

Game components are imported dynamically, allowing for future code splitting if needed.

### Backward Compatibility

The implementation maintains backward compatibility with existing code while adding new configuration capabilities.

## Testing

Since both games share the same business logic, existing tests cover both games. Game-specific configurations should be tested to ensure proper loading.

## Future Enhancements

1. **Asset Customization**: Add unique assets for Plinko X
2. **Multiplier Variations**: Implement different multiplier schemes
3. **UI Component Variations**: Allow component-level customizations
4. **Feature Flags**: Enable/disable features per game
5. **A/B Testing**: Support for testing different configurations
