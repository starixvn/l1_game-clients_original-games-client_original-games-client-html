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
