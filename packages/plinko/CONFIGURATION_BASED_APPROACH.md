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

The application uses a priority system to determine which game to load:

1. **Environment Variable** (Highest Priority)

    - `NEXT_PUBLIC_DEFAULT_GAME_ID` environment variable
    - Used for dedicated game servers (e.g., Plinko X server always serves game ID 159)
    - Example: `NEXT_PUBLIC_DEFAULT_GAME_ID=159 npm run dev-plinko-x`

2. **URL Path Extraction** (Medium Priority)

    - Extracts game ID from URL patterns like `/game-159` → game ID 159
    - Used for multi-game deployments where one server serves multiple games
    - Example: `/game-145` loads Plinko, `/game-159` loads Plinko X

3. **Default Fallback** (Lowest Priority)
    - Defaults to game ID 145 (Plinko) if no other method applies

**Server-Side Rendering**: Game ID is extracted during SSR using `getInitialProps`
**Client-Side Navigation**: Game ID is extracted from the router path with `useEffect`

### Build-Time Configuration

While the application can now detect games dynamically from URLs, you can still build specific versions using environment variables for optimization:

```bash
# Build Plinko-specific version
NEXT_PUBLIC_DEFAULT_GAME_ID=145 npm run build:standalone

# Build Plinko X-specific version
NEXT_PUBLIC_DEFAULT_GAME_ID=159 npm run build:standalone
```

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
