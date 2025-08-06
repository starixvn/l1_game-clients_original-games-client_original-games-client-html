# URL Context Documentation

This documentation provides comprehensive analysis of the URL context parameters (`isDirectMode`, `redirectUrl`, `isSabaPlay`, `gameId`) and their critical roles in the first login to lobby flow of the gaming application.

## 🚨 Latest Updates (Custom Version - Latest)

### ✅ **Major Custom Version Changes Applied**

**1. Register Component Removal**

-   **Change**: Completely removed the Register component page while keeping auto-create nickname flow
-   **Before**: Manual registration page with form inputs
-   **After**: Automatic nickname creation for SabaPlay users without manual intervention
-   **Impact**: Streamlined user experience, no manual registration required

**2. Lobby Functionality Removal**

-   **Change**: Removed entire lobby system and related components
-   **Before**: Full lobby with game selection, banners, and navigation
-   **After**: Direct game access only, no lobby interface
-   **Impact**: Simplified application flow, direct game access only

**3. Swiper Functionality Removal**

-   **Change**: Removed all swiper components and game switching functionality
-   **Before**: Users could swipe between different games
-   **After**: One game per session, no game switching allowed
-   **Impact**: Enforces single-game-per-session model for SSO players

**4. Custom Game Routing Logic**

-   **Change**: Implemented custom version that directs users to specific game ID
-   **Default Game ID**: 1005 if no valid game ID provided or game not found
-   **Validation**: Checks if game ID is available in enabled games
-   **Fallback**: Always defaults to game 1005 for invalid scenarios

**5. Shared Utilities Refactoring**

-   **Change**: Moved essential utilities to shared locations before component removal
-   **NameGenerator**: Moved to `src/_shared/helpers/name-generator.ts`
-   **MAX_AVATAR_ID**: Moved to `src/_shared/helpers/avatar-helper.ts`
-   **AvatarGallery**: Re-implemented in `src/components/game-components/avatar-gallery/`
-   **Impact**: Maintained functionality while removing original components

### **Current Custom Version Logic**

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

**Behavior**:

-   **Valid game ID provided**: Direct to specified game
-   **No game ID or game ID = 0**: Default to game 1005
-   **Invalid game ID**: Default to game 1005
-   **Game not in enabled list**: Default to game 1005

## 📋 Documentation Overview

### Core Analysis Documents

-   **[Latest Workflow Documentation](latest-workflow-documentation.md)** - Complete workflow based on console.logs and current implementation
-   **[URL Context Analysis](URL_Context_Analysis.md)** - Comprehensive analysis of URL context parameters and their roles
-   **[URL Parameter Combinations](URL_Parameter_Combinations.md)** - Complete matrix of all parameter combinations and behaviors
-   **[URL Context Flow Diagrams](URL_Context_Flow_Diagrams.md)** - Visual flow diagrams for all application scenarios
-   **[URL Context Testing Guide](URL_Context_Testing_Guide.md)** - Comprehensive testing guidelines and test cases
-   **[isDirectMode vs isSabaPlay Analysis](isDirectMode_vs_isSabaPlay_Analysis.md)** - Detailed comparison and confusion analysis

### Testing Documentation

-   **[First Login Redirect Lobby](first-login-redirect-lobby.md)** - Detailed flow analysis for first login to lobby
-   **[First Login Redirect Game](first-login-redirect-game.md)** - Detailed flow analysis for first login to game
-   **[URL Redundancy Handling Guide](URL_Redundancy_Handling_Guide.md)** - Guide for handling redundant URL parameters

### Recent Updates

-   **Register component removal**: Automatic nickname creation only
-   **Lobby functionality removal**: Direct game access only
-   **Swiper functionality removal**: One game per session
-   **Custom game routing**: Default to game 1005 for invalid scenarios
-   **Shared utilities refactoring**: Maintained functionality after component removal
-   **User-specific latestGameId**: Complete isolation per user
-   **HTML-encoded ampersands**: Fixed URL parsing issues
-   **Smart direct mode logic**: Proper lobby access handling
-   **Enhanced error handling**: Better fallback mechanisms
-   **Comprehensive logging**: Detailed console logs for debugging

## 🐛 Recent Bug Fixes & Major Changes

### 1. Register Component Removal - COMPLETED ✅

**Change**: Completely removed the Register component page while preserving auto-create nickname functionality.

**Files Removed**:
-   `src/components/page-components/dashboard/register/` (entire directory)
-   All register-related test files and components

**Files Created/Modified**:
-   `src/_shared/helpers/name-generator.ts` - Moved NameGenerator utility
-   `src/_shared/helpers/avatar-helper.ts` - Moved MAX_AVATAR_ID constant
-   `src/components/game-components/avatar-gallery/` - Re-implemented AvatarGallery
-   Updated imports in profile-picture, user-info, and change-avatar components

**Impact**: Users no longer see manual registration page, automatic nickname creation for SabaPlay users.

### 2. Lobby Functionality Removal - COMPLETED ✅

**Change**: Removed entire lobby system and related components.

**Files Removed**:
-   `src/components/page-components/lobby/` (entire directory)
-   `src/_shared/react-contexts/lobby-connection-context/` (entire directory)
-   All lobby-related components, styles, and tests

**Files Modified**:
-   `src/components/page-components/dashboard/index.tsx` - Removed lobby rendering logic
-   `src/components/page-components/dashboard/handlers/dash-board-handler.ts` - Simplified to always render games
-   `src/_shared/helpers/preload-resources.tsx` - Removed lobby banner references
-   `src/_shared/helpers/scoreboard-registry.ts` - Created dummy function for scoreboard compatibility

**Impact**: Application now directly renders games without lobby interface.

### 3. Swiper Functionality Removal - COMPLETED ✅

**Change**: Removed all swiper components and game switching functionality.

**Files Removed**:
-   `src/components/page-components/dashboard/button-swipe/` (entire directory)
-   `src/components/page-components/switch-games-guide/` (entire directory)

**Files Modified**:
-   `src/games/games.tsx` - Removed Swiper, SwiperSlide, and related logic
-   `src/games/type.ts` - Removed swiper-related props
-   `src/components/page-components/dashboard/index.tsx` - Removed swiper refs and buttons
-   `src/components/page-components/dashboard/type.ts` - Removed swiper-related state

**Impact**: Users can no longer switch between games, enforcing one-game-per-session model.

### 4. Custom Game Routing Implementation - COMPLETED ✅

**Change**: Implemented custom version with specific game routing logic.

**Key Features**:
-   Direct routing to specific game ID
-   Default to game 1005 for invalid scenarios
-   Validation against enabled games list
-   Fallback logic for unavailable games

**Impact**: Predictable game routing with proper fallbacks.

### 5. Cross-User latestGameId Interference - FIXED ✅

**Issue**: `latestGameId` was stored globally, causing cross-user interference when multiple users accessed the application.

**Root Cause**:
-   Global localStorage key used for all users
-   No user-specific isolation

**Fix Applied**:
-   **Storage Helper**: Added `getUserLatestGameId(username)` and `setUserLatestGameId(username, gameId)`
-   **Splash Screen**: Uses user-specific latestGameId instead of global one
-   **URL Context**: Stores and retrieves user-specific game IDs

**Impact**: Each user now has isolated game tracking, preventing cross-user interference.

### 6. HTML-Encoded Ampersands Breaking URL Parsing - FIXED ✅

**Issue**: URLs with `&amp;` (HTML-encoded ampersands) failed to parse correctly.

**Root Cause**:
-   URLSearchParams didn't handle HTML-encoded ampersands
-   Parsing failed for certain integration scenarios

**Fix Applied**:
-   **URL Context**: Added `searchParams.replace(/&amp;/g, '&')` before parsing
-   **Comprehensive Testing**: Verified all URL parameter combinations work

**Impact**: All URL parsing scenarios now work correctly, including HTML-encoded parameters.

### 7. SabaPlay Lobby Access Issues - FIXED ✅

**Issue**: SabaPlay users with `ref` and `rurl` parameters couldn't access lobby when `gameId=0`.

**Root Cause**:
-   Direct mode logic didn't properly handle lobby access scenarios
-   `rurl` parameter was always considered for direct mode calculation

**Fix Applied**:
-   **URL Context**: Enhanced direct mode logic to ignore `rurl` when `gameId=0`
-   **Effective Redirect URL**: Set to `null` when accessing lobby to prioritize lobby access

**Impact**: SabaPlay users can now access lobby properly regardless of `ref` and `rurl` parameters.

### 8. Dashboard Error Modal for Lobby Access - FIXED ✅

**Issue**: Dashboard showed error modal when accessing lobby in direct mode with `queryGame=0`.

**Root Cause**:
-   `checkIsNotOfferGame` incorrectly treated lobby access as "not in offer"
-   Direct mode logic didn't account for lobby scenarios

**Fix Applied**:
-   **Dashboard Handler**: Fixed `checkIsNotOfferGame` to return `false` for lobby access in direct mode
-   **Special Case Handling**: Added logic for `queryGame=0` in direct mode

**Impact**: Lobby access in direct mode no longer shows error modal.

## 🔧 Key Components

### URL Context Parameters

-   **`gameId`**: Determines which game to load or whether to show the lobby
-   **`isDirectMode`**: Controls SSO redirect logic bypass
-   **`redirectUrl`**: Base64 encoded URL for post-game redirection
-   **`isSabaPlay`**: Identifies SabaPlay platform integration

### Critical Decision Points

-   **Direct Mode vs Non-Direct Mode**: Different game selection logic
-   **SabaPlay Integration**: Auto nickname creation trigger
-   **Custom Game Routing**: Direct to specific game with fallback to 1005
-   **Game Service Availability**: Fallback logic for unavailable games
-   **User-Specific Storage**: Isolated game tracking per user
-   **One Game Per Session**: No game switching allowed

## 📊 Test Coverage

The documentation includes comprehensive test cases covering:

-   Happy path scenarios
-   Edge cases and error handling
-   All parameter combinations
-   Integration scenarios
-   User-specific storage scenarios
-   HTML-encoded URL scenarios
-   Custom game routing scenarios
-   Invalid game ID fallback scenarios

## 🚀 Getting Started

1. Start with **[Latest Workflow Documentation](latest-workflow-documentation.md)** for current implementation
2. Review **[URL Context Analysis](URL_Context_Analysis.md)** for detailed parameter analysis
3. Check **[URL Parameter Combinations](URL_Parameter_Combinations.md)** for specific scenarios
4. Use **[URL Context Testing Guide](URL_Context_Testing_Guide.md)** for testing implementation

## 📝 Contributing

When making changes to URL context logic:

1. Update the relevant documentation files
2. Add test cases to the testing guide
3. Update flow diagrams if needed
4. Document any new parameter combinations
5. Ensure user-specific storage is maintained
6. Test HTML-encoded URL scenarios
7. Verify custom game routing logic
8. Test one-game-per-session enforcement

## 🔍 Testing Scenarios

### Scenario 1: SabaPlay Direct Game Access

-   URL: `?token=xxx&gameId=1003&op=SP`
-   Expected: Direct mode, game 1003, no error modal

### Scenario 2: SabaPlay Invalid Game Access

-   URL: `?token=xxx&gameId=9999&op=SP`
-   Expected: Direct mode, fallback to game 1005

### Scenario 3: SabaPlay No Game ID

-   URL: `?token=xxx&op=SP` (no gameId)
-   Expected: Direct mode, default to game 1005

### Scenario 4: HTML-Encoded URL

-   URL: `?token=xxx&amp;gameId=1003&amp;op=SP`
-   Expected: Properly parsed, direct mode, game 1003

### Scenario 5: User-Specific Storage

-   Multiple users accessing same application
-   Expected: Each user has isolated latestGameId storage

### Scenario 6: One Game Per Session

-   User attempts to switch games
-   Expected: No swiper functionality, single game only

### Scenario 7: Auto Nickname Creation

-   SabaPlay user without nickname
-   Expected: Automatic nickname creation, no manual registration

## 🎯 Custom Version Features

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
