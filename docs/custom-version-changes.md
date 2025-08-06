# Custom Version Changes Documentation

## Overview

This document details all the major changes made to create the custom version of the gaming application. The custom version removes the Register component, lobby functionality, and swiper functionality while implementing custom game routing logic that defaults to game ID 1005 for invalid scenarios.

## Table of Contents

1. [Register Component Removal](#register-component-removal)
2. [Lobby Functionality Removal](#lobby-functionality-removal)
3. [Swiper Functionality Removal](#swiper-functionality-removal)
4. [Custom Game Routing Implementation](#custom-game-routing-implementation)
5. [Shared Utilities Refactoring](#shared-utilities-refactoring)
6. [File Changes Summary](#file-changes-summary)
7. [Testing Scenarios](#testing-scenarios)
8. [Impact Analysis](#impact-analysis)

## Register Component Removal

### Rationale
The Register component was removed to streamline the user experience. Instead of showing a manual registration form, the application now automatically creates nicknames for SabaPlay users without any user intervention.

### Files Removed
- `src/components/page-components/dashboard/register/` (entire directory)
  - `register.tsx`
  - `register.module.scss`
  - `register.test.tsx`
  - `register.test.tsx.snap`
  - `name-generator.ts`
  - `preload-resource/` (entire subdirectory)
  - `__tests__/` (entire subdirectory)

### Files Created
- `src/_shared/helpers/name-generator.ts` - Moved NameGenerator utility
- `src/_shared/helpers/avatar-helper.ts` - Moved MAX_AVATAR_ID constant
- `src/components/game-components/avatar-gallery/` - Re-implemented AvatarGallery component

### Code Changes

#### Splash Screen Logic Update
```typescript
// Before: Manual registration flow
if (!authorizeInfo?.authorized && isSabaPlay) {
    // Show Register component
    this.setState({ isRenderRegister: true });
}

// After: Automatic nickname creation
if (!authorizeInfo?.authorized && isSabaPlay) {
    // Auto create nickname without user intervention
    const autoCreateResult = await autoCreateNickname(session, isSabaPlay);
    // Continue with auto-created nickname
}
```

#### Import Updates
- Updated `src/components/page-components/profile-picture/index.tsx`
- Updated `src/components/page-components/header/user-info/index.tsx`
- Updated `src/components/page-components/header/change-avatar/index.tsx`

## Lobby Functionality Removal

### Rationale
The lobby system was completely removed to simplify the application flow. Users now directly access games without any intermediate lobby interface.

### Files Removed
- `src/components/page-components/lobby/` (entire directory)
  - `lobby.tsx`
  - `lobby.module.scss`
  - `type.ts`
  - `lobby-socket-connection.ts`
  - `games/` (entire subdirectory)
  - `banners/` (entire subdirectory)
  - `__tests__/` (entire subdirectory)

- `src/_shared/react-contexts/lobby-connection-context/` (entire directory)
  - `index.tsx`

### Files Modified

#### Dashboard Component (`src/components/page-components/dashboard/index.tsx`)
```typescript
// Before: Conditional lobby/games rendering
renderDashBoard() {
    const isRenderGames = this.dashboardHandler.shouldRenderGames();
    if (isRenderGames) {
        return this.renderGames();
    } else {
        return this.renderLobby();
    }
}

// After: Always render games
renderDashBoard() {
    const isRenderGames = true; // Custom version: Always render games
    return this.renderGames();
}
```

#### Dashboard Handler (`src/components/page-components/dashboard/handlers/dash-board-handler.ts`)
```typescript
// Before: Complex lobby logic
public readonly lobbyConnection: LobbySocketConnection;
public shouldRenderGames(): boolean {
    // Complex logic to determine if games should be rendered
}

// After: Simplified logic
public shouldRenderGames(): boolean {
    return true; // Custom version: Always render games
}
```

#### Preload Resources (`src/_shared/helpers/preload-resources.tsx`)
```typescript
// Before: Lobby banner handling
const getAndHandleBannerOffer = (lobbyConfigs, authorizeInfo) => {
    const banner = getGameIdOfferBanner(lobbyConfigs, authorizeInfo);
    // Handle banner logic
};

// After: No lobby banners
const getAndHandleBannerOffer = (lobbyConfigs, authorizeInfo) => {
    // Custom version: No lobby functionality, so this does nothing
    return;
};
```

#### Scoreboard Registry (`src/_shared/helpers/scoreboard-registry.ts`)
```typescript
// Created new file to provide dummy function
export const registerBigRoadElement = (element: any, converter: any, ...gameIds: number[]) => {
    // Custom version: No lobby functionality, so this does nothing
    return;
};
```

### Import Updates
- Updated all game scoreboard files to import from new registry
- Removed lobby-related imports from dashboard and other components

## Swiper Functionality Removal

### Rationale
The swiper functionality was removed to enforce a "one game per session" model. Users can no longer switch between games, ensuring a consistent single-game experience.

### Files Removed
- `src/components/page-components/dashboard/button-swipe/` (entire directory)
  - `index.tsx`
  - `button-swipe.module.scss`

- `src/components/page-components/switch-games-guide/` (entire directory)
  - `index.tsx`
  - `switch-games-guide.module.scss`
  - `index.test.tsx`
  - `index.test.tsx.snap`

### Files Modified

#### Games Component (`src/games/games.tsx`)
```typescript
// Before: Swiper-based game switching
import { Swiper, SwiperSlide } from "swiper/react";
import { SwiperNoSwiping } from "../_shared/constants";

export const Games: React.FC<Props> = ({
    swiperRef,
    lobbyGamesIds,
    // ... other props
}) => {
    const renderSwiper = (openGameId: number) => {
        return (
            <Swiper
                onBeforeInit={(swiper) => (swiperRef.current = swiper)}
                // ... swiper configuration
            >
                {renderSwiperItems()}
            </Swiper>
        );
    };

    return (
        <div className={styles["game-wrapper"]}>
            {getGameComponentById(openGameId)}
        </div>
    );
};

// After: Direct game rendering
export const Games: React.FC<Props> = ({
    // swiperRef and lobbyGamesIds removed
    // ... other props
}) => {
    return (
        <div className={styles["game-wrapper"]}>
            {getGameComponentById(openGameId)}
        </div>
    );
};
```

#### Games Type (`src/games/type.ts`)
```typescript
// Before: Swiper-related props
export type Props = {
    // ... other props
    lobbyGamesIds: Array<number>;
    swiperRef: any;
};

// After: Simplified props
export type Props = {
    // ... other props
    // swiperRef and lobbyGamesIds removed
};
```

#### Dashboard Component (`src/components/page-components/dashboard/index.tsx`)
```typescript
// Before: Swiper refs and buttons
import SwiperCore from "swiper";
import ButtonSwipe from "./button-swipe";

class Dashboard extends React.Component<DashboardProps, DashboardState> {
    private readonly swiperRef = React.createRef<SwiperCore>();
    
    renderDashBoard() {
        return (
            <div>
                {allowSwipeGameOndDesktop && <ButtonSwipe isPrev={true} swiper={this.swiperRef} />}
                {/* Dashboard content */}
                {allowSwipeGameOndDesktop && <ButtonSwipe isPrev={false} swiper={this.swiperRef} />}
            </div>
        );
    }
}

// After: No swiper functionality
class Dashboard extends React.Component<DashboardProps, DashboardState> {
    // swiperRef removed
    
    renderDashBoard() {
        return (
            <div>
                {/* Dashboard content only */}
            </div>
        );
    }
}
```

#### Dashboard State (`src/components/page-components/dashboard/type.ts`)
```typescript
// Before: Swiper-related state
export type DashboardState = {
    // ... other state
    isChangedGame: boolean;
    isChangePrevGame: boolean;
};

// After: Simplified state
export type DashboardState = {
    // ... other state
    // isChangedGame and isChangePrevGame removed
};
```

## Custom Game Routing Implementation

### Rationale
Implemented custom game routing logic that always directs users to a specific game ID, with game 1005 as the default fallback for invalid scenarios.

### Code Changes

#### Splash Screen Logic (`src/components/page-components/splash-screen/index.tsx`)
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

### Behavior
- **Valid game ID provided**: Direct to specified game
- **No game ID or game ID = 0**: Default to game 1005
- **Invalid game ID**: Default to game 1005
- **Game not in enabled list**: Default to game 1005

## Shared Utilities Refactoring

### Rationale
Essential utilities from the removed Register component were moved to shared locations to maintain functionality while removing the original component.

### Files Created

#### Name Generator (`src/_shared/helpers/name-generator.ts`)
```typescript
import { uniqueNamesGenerator } from "unique-names-generator";

// Name dictionaries moved from Register component
const NEW_202010 = [
    "Power", "Super", "Mega", "Ultra", "Hyper", "Neo", "Quantum", "Alpha", "Beta", "Gamma", "Delta", "Omega",
    // ... more names
];

const Animals = [
    "Tiger", "Lion", "Eagle", "Wolf", "Bear", "Shark", "Falcon", "Panther", "Leopard", "Cheetah",
    // ... more animals
];

export class NameGenerator {
    static generateName(): string {
        return uniqueNamesGenerator({
            dictionaries: [NEW_202010, Animals],
            length: 2,
            separator: "",
            style: "capital",
        });
    }
}
```

#### Avatar Helper (`src/_shared/helpers/avatar-helper.ts`)
```typescript
// Avatar helper constants and utilities
export const MAX_AVATAR_ID = 40;
```

#### Avatar Gallery (`src/components/game-components/avatar-gallery/`)
- Re-implemented the AvatarGallery component and its sub-components
- Maintained all functionality for avatar selection
- Updated imports in related components

## File Changes Summary

### Files Removed (Total: ~50+ files)
- Register component directory and all subdirectories
- Lobby component directory and all subdirectories
- Lobby connection context directory
- Button swipe component directory
- Switch games guide component directory
- All related test files and snapshots

### Files Created (Total: ~10 files)
- `src/_shared/helpers/name-generator.ts`
- `src/_shared/helpers/avatar-helper.ts`
- `src/_shared/helpers/scoreboard-registry.ts`
- `src/components/game-components/avatar-gallery/` (entire directory)
- `tsconfig.node.json`
- `src/_shared/tolgee-generator-standalone.ts`

### Files Modified (Total: ~20 files)
- `src/components/page-components/splash-screen/index.tsx`
- `src/components/page-components/dashboard/index.tsx`
- `src/components/page-components/dashboard/handlers/dash-board-handler.ts`
- `src/components/page-components/dashboard/type.ts`
- `src/games/games.tsx`
- `src/games/type.ts`
- `src/_shared/helpers/preload-resources.tsx`
- `src/_shared/react-contexts/index.ts`
- All game scoreboard files
- Import updates in profile-picture, user-info, and change-avatar components

## Testing Scenarios

### Scenario 1: SabaPlay Direct Game Access
- **URL**: `?token=xxx&gameId=1003&op=SP`
- **Expected**: Direct mode, game 1003, no error modal, no registration form

### Scenario 2: SabaPlay Invalid Game Access
- **URL**: `?token=xxx&gameId=9999&op=SP`
- **Expected**: Direct mode, fallback to game 1005, no error modal

### Scenario 3: SabaPlay No Game ID
- **URL**: `?token=xxx&op=SP` (no gameId)
- **Expected**: Direct mode, default to game 1005, no error modal

### Scenario 4: SabaPlay User Without Nickname
- **URL**: `?token=xxx&gameId=1003&op=SP`
- **Expected**: Automatic nickname creation, no manual registration form

### Scenario 5: One Game Per Session
- **Action**: User attempts to switch games
- **Expected**: No swiper functionality, single game only, no game switching

### Scenario 6: HTML-Encoded URL
- **URL**: `?token=xxx&amp;gameId=1003&amp;op=SP`
- **Expected**: Properly parsed, direct mode, game 1003

### Scenario 7: User-Specific Storage
- **Action**: Multiple users accessing same application
- **Expected**: Each user has isolated latestGameId storage

## Impact Analysis

### Positive Impacts
1. **Simplified User Experience**: No manual registration or lobby navigation
2. **Consistent Game Experience**: One game per session ensures focused gameplay
3. **Reduced Complexity**: Fewer components and less code to maintain
4. **Faster Loading**: No lobby interface or game switching overhead
5. **Predictable Routing**: Always defaults to game 1005 for invalid scenarios

### Potential Considerations
1. **Limited Game Selection**: Users cannot choose different games within a session
2. **No Lobby Features**: Removed social and informational features from lobby
3. **Reduced Flexibility**: Less customization options for users
4. **Dependency on Game 1005**: Heavy reliance on default game ID

### Technical Benefits
1. **Reduced Bundle Size**: Fewer components and dependencies
2. **Simplified State Management**: Less complex state logic
3. **Easier Testing**: Fewer components to test
4. **Better Performance**: No swiper animations or lobby loading

### Business Benefits
1. **Streamlined Onboarding**: Automatic nickname creation
2. **Focused User Experience**: Single game per session
3. **Reduced Support**: Less complexity means fewer user issues
4. **Predictable User Flow**: Consistent experience across all users

## Conclusion

The custom version successfully removes the Register component, lobby functionality, and swiper functionality while maintaining essential features through automatic nickname creation and custom game routing. The application now provides a streamlined, single-game-per-session experience with predictable fallback behavior to game 1005.

All changes have been thoroughly tested and the application builds and runs successfully with the new custom version implementation.
