# Latest Workflow Documentation (Custom Version)

## Overview

This document describes the complete workflow for the **custom version** of the game client application, including URL parsing, authentication, routing, and game rendering. This version has been modified to remove the Register component, lobby functionality, and swiper functionality while implementing custom game routing logic.

## Table of Contents

1. [URL Context Parsing](#url-context-parsing)
2. [Splash Screen Initialization](#splash-screen-initialization)
3. [Authentication Flow](#authentication-flow)
4. [Dashboard Rendering](#dashboard-rendering)
5. [Game Rendering Logic](#game-rendering-logic)
6. [Auto Nickname Creation](#auto-nickname-creation)
7. [Custom Game Routing](#custom-game-routing)
8. [Header Title Logic](#header-title-logic)

## URL Context Parsing

### File: `src/_shared/react-contexts/url-context.ts`

#### Console Logs:

```
[URLContext] loadURLContext - Starting URL context loading
[URLContext] parseContextFromURL - URL search params: ?token=xxx&lang=vi-VN&appType=1&gameId=1003&op=SP&cg=SabaPlay_VN
[URLContext] parseContextFromURL - Decoded search params: ?token=xxx&lang=vi-VN&appType=1&gameId=1003&op=SP&cg=SabaPlay_VN
[URLContext] parseContextFromURL - All params: (6) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2)]
[URLContext] parseContextFromURL - SabaPlay calculation: {op: 'SP', isSabaPlay: true, gameId: 1003}
[URLContext] parseContextFromURL - Parsed result: {token: 'xxx', language: 'vi-VN', gameId: 1003, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
[URLContext] loadURLContext - Context from URL: {token: 'xxx', language: 'vi-VN', gameId: 1003, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
[URLContext] loadURLContext - Context from localStorage: {language: 'vi-VN', gameId: 0, redirectUrl: null, firstSSOToLobby: false, isSabaPlay: true}
[URLContext] loadURLContext - Storing context in localStorage: {token: undefined, language: 'vi-VN', gameId: 1003, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
[URLContext] loadURLContext - Final context returned: {token: 'xxx', language: 'vi-VN', gameId: 1003, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
```

#### Key Logic:

1. **HTML-encoded ampersands handling**: Decodes `&amp;` to `&` before parsing
2. **User-specific latestGameId**: Uses username to create isolated storage keys
3. **SabaPlay calculation**:
    - `isSabaPlay = op === 'SP'`
    - Triggers auto nickname creation for SabaPlay platform integration
4. **Context storage**: Stores context in localStorage without token for security

## Splash Screen Initialization

### File: `src/components/page-components/splash-screen/index.tsx`

#### Console Logs:

```
[SplashScreen] handleInitialization - Starting initialization
[SplashScreen] handleInitialization - URL Context values: {gameId: 1003, token: 'xxx', language: 'vi-VN', firstSSOToLobby: true, isSabaPlay: true}
[SplashScreen] handleInitialization - Session retrieved: {isAuthenticated: true, umInfo: null, username: 'SabaPlay_4100300~401837', language: 'vi-VN', ss: 'xxx'}
[SplashScreen] handleInitialization - Language loaded: vi
[SplashScreen] handleInitialization - Authorization result: {authorized: true, user: {...}, umInfo: null, isUM: false}
[SplashScreen] handleInitialization - Checking auto nickname creation conditions
[SplashScreen] handleInitialization - authorizeInfo?.authorized: true
[SplashScreen] handleInitialization - isSabaPlay: true
[SplashScreen] handleInitialization - Condition: !authorizeInfo?.authorized && isSabaPlay = false
[SplashScreen] handleInitialization - Final authorization check: true
[SplashScreen] handleInitialization - User authorized, loading lobby configs
[SplashScreen] handleInitialization - Initial toLoadGameId: 1003
[SplashScreen] handleInitialization - Custom version: Always direct to specific game, default to 1005 if no valid gameId
[SplashScreen] handleInitialization - Final toLoadGameId set: 1003
[SplashScreen] handleInitialization - Running custom startup
[SplashScreen] handleInitialization - Custom startup completed, isDoneLoadConfig set to true
```

#### Key Logic:

1. **Session retrieval**: Gets session from token or verifies existing session
2. **Language loading**: Maps language codes and sets Tolgee language
3. **Authorization check**: Verifies user authorization status
4. **Auto nickname creation**: For SabaPlay users who aren't authorized
5. **Custom game routing**: 
    - **Custom version logic**: Always direct to specific game ID
    - **Default game ID**: 1005 if no valid game ID provided or game not found
    - **Validation**: Checks if game ID is available in enabled games
    - **Fallback**: Always defaults to game 1005 for invalid scenarios
6. **User-specific latestGameId**: Uses `getUserLatestGameId(player?.session?.username)`

## Authentication Flow

### Auto Nickname Creation (SabaPlay)

```
[SplashScreen] handleInitialization - Auto creating nickname for SabaPlay
[SplashScreen] handleInitialization - Auto nickname creation result: {authorized: true, user: {...}, umInfo: null, isUM: false}
```

**Key Changes in Custom Version**:
- **No manual registration**: Register component has been completely removed
- **Automatic nickname creation**: SabaPlay users get automatic nickname generation
- **Seamless experience**: No user intervention required for registration

## Dashboard Rendering

### File: `src/components/page-components/dashboard/index.tsx`

#### Console Logs:

```
[Dashboard] constructor - Props received: {queryGame: 1003, authorizeResponse: {...}, lobbyConfigs: {...}}
[Dashboard] constructor - Initial state set: {queryGame: 1003, openGameId: null, authorizeInfo: {...}}
[Dashboard] constructor - Dashboard initialized successfully
[Dashboard] render - Component render called
[Dashboard] render - Rendering dashboard
[Dashboard] renderDashBoard - Starting dashboard render
[Dashboard] componentDidMount - Starting component initialization
[Dashboard] componentDidMount - Checking if game is not in offer
[Dashboard] componentDidMount - Opening game from queryGame: 1003
[Dashboard] openGame - Opening game: 1003
[Dashboard] openGame - Game opened and URL context updated
[Dashboard] componentDidMount - Component initialization complete
```

#### Key Logic:

1. **Props validation**: Validates queryGame, authorizeResponse, lobbyConfigs
2. **State initialization**: Sets initial state with queryGame and empty openGameId
3. **Game offer check**: Verifies if the requested game is available
4. **Game opening**: Automatically opens the game if it's in the offer list
5. **No lobby rendering**: Custom version always renders games, no lobby interface

## Game Rendering Logic

### File: `src/components/page-components/dashboard/handlers/dash-board-handler.ts`

#### Console Logs:

```
[DashboardHandler] constructor - Props: {router: {...}, data-testid: 'dashboard-component', session: {...}, queryGame: 1003, setIsUm: ƒ, authorizeResponse: {...}, lobbyConfigs: {...}}
[DashboardHandler] checkIsNotOfferGame - offerGames: (7) [1001, 1002, 1003, 1004, 1005, 1006, 1007]
[DashboardHandler] checkIsNotOfferGame - props: {queryGame: 1003}
[DashboardHandler] checkIsNotOfferGame - Direct mode result: false
[DashboardHandler] shouldRenderGames - Input: {offerGames: Array(7), openGameId: 1003}
[DashboardHandler] shouldRenderGames - URL context: {backToLobby: true, ssoRedirectGameId: 1003}
[DashboardHandler] shouldRenderGames - Effective gameId: 1003
[DashboardHandler] shouldRenderGames - Final result: true
[DashboardHandler] shouldRenderGames - Breakdown: {effectiveGameId: 1003, offerGamesIncludes: true, notBackToLobby: false, ssoRedirectGameIdGreaterThan0: true}
```

#### Key Logic:

1. **Game offer validation**: Checks if the game is in the available offer list
2. **Direct mode handling**: Special logic for direct mode with `queryGame: 0` (lobby)
3. **Game rendering decision**: **Custom version always renders games, no lobby**
4. **Effective game ID calculation**: Uses openGameId or falls back to ssoRedirectGameId

### Special Cases:

-   **Lobby access with direct mode**: `queryGame: 0` returns `false` for "not in offer"
-   **Invalid game IDs**: Returns `true` for "not in offer" and shows error modal

## Auto Nickname Creation

### File: `src/components/page-components/splash-screen/index.tsx`

#### Key Logic:

1. **Automatic trigger**: For SabaPlay users who aren't authorized
2. **No manual form**: No registration form shown to users
3. **Automatic generation**: Uses NameGenerator utility from shared helpers
4. **Seamless flow**: User doesn't see any registration process

#### Shared Utilities (Moved from Register Component):

-   **NameGenerator**: `src/_shared/helpers/name-generator.ts`
-   **MAX_AVATAR_ID**: `src/_shared/helpers/avatar-helper.ts`
-   **AvatarGallery**: `src/components/game-components/avatar-gallery/`

## Custom Game Routing

### File: `src/components/page-components/splash-screen/index.tsx`

#### Custom Version Logic:

```typescript
// Custom version: Always direct to specific game, default to 1005 if no valid gameId
let toLoadGameId = gameId;

// If no gameId provided or gameId is 0, use default game 1005
if (!toLoadGameId || toLoadGameId === 0) {
    toLoadGameId = 1005;
}

// Validate if the gameId is available in the enabled games
const enabledRenderGameSettings = getEnabledRenderGameSettings(lobbyConfigs as any, authorizeInfo);
const isGameAvailable = enabledRenderGameSettings.some(game => game.id === toLoadGameId);

// If game is not available, use default game 1005
if (!isGameAvailable) {
    toLoadGameId = 1005;
}
```

#### Behavior:

-   **Valid game ID provided**: Direct to specified game
-   **No game ID or game ID = 0**: Default to game 1005
-   **Invalid game ID**: Default to game 1005
-   **Game not in enabled list**: Default to game 1005

## Game Component Rendering

### File: `src/games/games.tsx`

#### Key Changes in Custom Version:

1. **No Swiper functionality**: Removed all swiper-related imports and logic
2. **No game switching**: Users cannot switch between games
3. **Single game rendering**: Only renders the specified game component
4. **No SwitchGamesGuide**: Removed the guide component for switching games

#### Console Logs:

```
[Games] render - Rendering game component for gameId: 1003
[Games] getGameComponentById - Getting component for game: 1003
[Games] getGameComponentById - Returning BacBall component
```

## Header Title Logic

### File: `src/components/page-components/header/header-title/index.tsx`

#### Key Logic:

1. **Logo selection**:
    - SabaPlay: Shows SabaPlay logo
    - Non-direct mode: Shows site logo
    - Direct mode: No logo (empty)
2. **Title display**:
    - Games mode: Shows game name with animation
    - **Custom version**: Always shows game name (no lobby mode)
3. **Translation**: Uses game-specific translation namespace

## Complete Workflow Summary (Custom Version)

### 1. URL Parsing Phase

-   Decodes HTML-encoded ampersands
-   Determines direct mode based on parameters
-   Handles user-specific latestGameId storage
-   Ignores rurl when gameId=0 (lobby)

### 2. Splash Screen Phase

-   Retrieves and validates session
-   Loads language settings
-   Checks authorization status
-   **Auto-creates nickname for SabaPlay users if needed (no manual registration)**
-   **Determines target gameId using custom routing logic (default to 1005)**

### 3. Authentication Phase

-   Validates user credentials
-   **Creates nickname automatically if required (no manual form)**
-   Loads lobby configurations
-   **Handles custom game routing logic**

### 4. Dashboard Phase

-   Initializes dashboard with props
-   Validates game availability
-   **Always renders games (no lobby interface)**
-   Opens games automatically if in direct mode

### 5. Game Rendering Phase

-   Checks if game is in offer list
-   Handles special cases (lobby with direct mode)
-   **Renders single game component (no swiper, no game switching)**
-   **No game transmitters or lobby connections**

### 6. Auto Nickname Creation Phase (if needed)

-   **No registration form shown**
-   **Automatic nickname generation for SabaPlay users**
-   **Seamless user experience**
-   Preloads resources
-   Redirects to dashboard

### 7. **No Lobby Phase**

-   **Lobby functionality completely removed**
-   **No game selection interface**
-   **No lobby analytics or state management**

## Key Changes in Custom Version

1. **Register component removal**: No manual registration, automatic nickname creation only
2. **Lobby functionality removal**: Direct game access only, no lobby interface
3. **Swiper functionality removal**: One game per session, no game switching
4. **Custom game routing**: Default to game 1005 for invalid scenarios
5. **Shared utilities refactoring**: Maintained functionality after component removal
6. **User-specific latestGameId**: Prevents cross-user interference
7. **HTML-encoded ampersands handling**: Fixes URL parsing issues
8. **Smart direct mode logic**: Handles lobby access properly
9. **Enhanced error handling**: Better error modal management
10. **Comprehensive logging**: Detailed console logs for debugging

## Testing Scenarios (Custom Version)

### Scenario 1: SabaPlay Direct Game Access

-   URL: `?token=xxx&gameId=1003&op=SP`
-   Expected: Direct mode, game 1003, no error modal, no registration form

### Scenario 2: SabaPlay Invalid Game Access

-   URL: `?token=xxx&gameId=9999&op=SP`
-   Expected: Direct mode, fallback to game 1005, no error modal

### Scenario 3: SabaPlay No Game ID

-   URL: `?token=xxx&op=SP` (no gameId)
-   Expected: Direct mode, default to game 1005, no error modal

### Scenario 4: SabaPlay User Without Nickname

-   URL: `?token=xxx&gameId=1003&op=SP`
-   Expected: Automatic nickname creation, no manual registration form

### Scenario 5: One Game Per Session

-   User attempts to switch games
-   Expected: No swiper functionality, single game only, no game switching

### Scenario 6: HTML-Encoded URL

-   URL: `?token=xxx&amp;gameId=1003&amp;op=SP`
-   Expected: Properly parsed, direct mode, game 1003

### Scenario 7: User-Specific Storage

-   Multiple users accessing same application
-   Expected: Each user has isolated latestGameId storage

## Custom Version Features

### 1. Automatic Nickname Creation
-   No manual registration required
-   Automatic nickname generation for SabaPlay users
-   Seamless user experience

### 2. Direct Game Access
-   No lobby interface
-   Direct routing to specific games
-   Simplified application flow

### 3. One Game Per Session
-   No game switching functionality
-   Enforced single-game model
-   Consistent user experience

### 4. Smart Game Routing
-   Default to game 1005 for invalid scenarios
-   Validation against enabled games
-   Proper fallback mechanisms

### 5. User-Specific Storage
-   Isolated game tracking per user
-   No cross-user interference
-   Secure user data handling

This documentation provides a comprehensive overview of the custom version workflow with all major changes applied.
