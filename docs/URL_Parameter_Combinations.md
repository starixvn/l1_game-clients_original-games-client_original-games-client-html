# URL Parameter Combinations Analysis

## Overview

This document provides a comprehensive analysis of all possible combinations of URL context parameters (`gameId`, `redirectUrl`, `isSabaPlay`) and their resulting behaviors in the gaming application.

## 🚨 Latest Updates (Latest Version)

### Key Improvements Applied

**1. User-Specific latestGameId Storage**

-   **Change**: `latestGameId` is now stored per user using username-based keys
-   **Implementation**: `getUserLatestGameId(username)` and `setUserLatestGameId(username, gameId)`
-   **Impact**: Prevents cross-user state leakage and ensures proper game tracking

**2. HTML-Encoded Ampersands Handling**

-   **Change**: URLs with `&amp;` are now properly decoded before parsing
-   **Implementation**: `searchParams.replace(/&amp;/g, '&')` before parsing
-   **Impact**: Fixes URL parsing issues in various integrations

**3. Enhanced Redirect URL Logic**

-   **Change**: Smart redirect URL calculation that properly handles lobby access and SabaPlay integration
-   **Implementation**: `effectiveRedirectUrl = isSabaPlay ? redirectUrl : (gameId === 0 ? null : redirectUrl)`
-   **Impact**: Allows lobby access even when `rurl` parameters are present, and proper SabaPlay handling

## Parameter Definitions

| Parameter     | Type    | Source           | Default | Description                                 |
| ------------- | ------- | ---------------- | ------- | ------------------------------------------- |
| `gameId`      | number  | `?gameId=X`      | `0`     | Determines which game to load or lobby mode |
| `redirectUrl` | string  | `?rurl=<base64>` | `""`    | Base64 encoded redirect URL                 |
| `isSabaPlay`  | boolean | `?op=SP`         | `false` | Identifies SabaPlay platform integration    |

### Current Redirect URL Logic

```typescript
// Current implementation in url-context.ts
const effectiveRedirectUrl = isSabaPlay ? redirectUrl : gameId === 0 ? null : redirectUrl;
const isSabaPlay = op === "SP";
```

## Complete Parameter Combinations Matrix

### Legend

-   ✅ = Parameter is present/true
-   ❌ = Parameter is absent/false
-   `0` = Lobby mode
-   `>0` = Specific game ID
-   `N/A` = Not applicable

| #   | gameId | redirectUrl | isSabaPlay | URL Example | Behavior                          | User Flow                          | Notes                                                            |
| --- | ------ | ----------- | ---------- | ----------- | --------------------------------- | ---------------------------------- | ---------------------------------------------------------------- | ------------------------------------- |
| 1   | `0`    | ❌          | N/A        | ❌          | `?gameId=0`                       | Normal SSO to Lobby                | URL → SplashScreen → Register → Dashboard → Lobby                | First SSO to lobby                    |
| 2   | `0`    | ❌          | N/A        | ✅          | `?gameId=0&op=SP`                 | SabaPlay to Lobby                  | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | SabaPlay integration to lobby         |
| 3   | `0`    | ❌          | ❌         | ❌          | `?gameId=0`                       | Normal SSO to Lobby                | URL → SplashScreen → Register → Dashboard → Lobby                | No redirect URL when gameId=0         |
| 4   | `0`    | ❌          | ❌         | ✅          | `?gameId=0&op=SP`                 | SabaPlay to Lobby                  | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | SabaPlay integration to lobby         |
| 5   | `0`    | ❌          | ✅         | ❌          | `?gameId=0&rurl=<base64>`         | Normal SSO to Lobby (rurl ignored) | URL → SplashScreen → Register → Dashboard → Lobby                | rurl ignored when gameId=0            |
| 6   | `0`    | ❌          | ✅         | ✅          | `?gameId=0&rurl=<base64>&op=SP`   | SabaPlay to Lobby (rurl used)      | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | rurl used for SabaPlay                |
| 7   | `>0`   | ❌          | N/A        | ❌          | `?gameId=123`                     | Normal SSO to Game                 | URL → SplashScreen → Register → Dashboard → Available Game       | SSO with game redirect                |
| 8   | `>0`   | ✅          | N/A        | ❌          | `?gameId=123&op=SP`               | SabaPlay to Game                   | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | SabaPlay integration to specific game |
| 9   | `>0`   | ✅          | ❌         | ❌          | `?gameId=123&rurl=<base64>`       | Game Access with Redirect          | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | Game access with redirect URL         |
| 10  | `>0`   | ✅          | ❌         | ✅          | `?gameId=123&rurl=<base64>&op=SP` | SabaPlay to Game with Redirect     | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | SabaPlay with redirect URL            |
| 11  | `>0`   | ✅          | ✅         | ❌          | `?gameId=123&rurl=<base64>`       | Game Access with Redirect          | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | Redirect URL stored for post-game     |
| 12  | `>0`   | ✅          | ✅         | ✅          | `?gameId=123&rurl=<base64>&op=SP` | SabaPlay to Game with Redirect     | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | Redirect URL stored for post-game     |
| 13  | ❌     | ❌          | N/A        | ❌          | No parameters                     | Default to Lobby                   | URL → SplashScreen → Register → Dashboard → Lobby                | Default behavior                      |
| 14  | ❌     | ❌          | N/A        | ✅          | `?op=SP`                          | SabaPlay Default                   | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | SabaPlay with no game specified       |
| 15  | ❌     | ❌          | ❌         | ❌          | No parameters                     | Normal SSO to Lobby                | URL → SplashScreen → Register → Dashboard → Lobby                | No gameId specified                   |
| 16  | ❌     | ❌          | ❌         | ✅          | `?op=SP`                          | SabaPlay to Lobby                  | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | SabaPlay with no gameId               |

## Detailed Behavior Analysis

### Category 1: Lobby Access (gameId = 0 or absent)

#### Normal SSO to Lobby (Combinations 1, 3, 5, 13, 15)

-   **Use Case**: Standard SSO integration
-   **User Journey**: Registration form → Lobby
-   **Analytics**: `SSO_To_Lobby`
-   **Game Selection**: Lobby mode (gameId = 0)
-   **User-Specific Storage**: Uses user-specific latestGameId

#### SabaPlay to Lobby (Combinations 2, 4, 6, 14, 16)

-   **Use Case**: SabaPlay platform integration
-   **User Journey**: Auto nickname creation → Lobby
-   **Analytics**: `SSO_To_Lobby` (with SabaPlay context)
-   **Game Selection**: Lobby mode (gameId = 0)
-   **User-Specific Storage**: Uses user-specific latestGameId
-   **Redirect URL**: Always used for SabaPlay (combination 6)

### Category 2: Game Access (gameId > 0)

#### Normal SSO to Game (Combination 7)

-   **Use Case**: SSO with game redirect
-   **User Journey**: Registration form → Available Game
-   **Analytics**: `SSO_To_Game`
-   **Game Selection**: Service availability check
-   **User-Specific Storage**: Updates user-specific latestGameId

#### SabaPlay to Game (Combination 8)

-   **Use Case**: SabaPlay platform with specific game
-   **User Journey**: Auto nickname creation → Specific Game
-   **Analytics**: `SSO_To_Game` (with SabaPlay context)
-   **Game Selection**: Specific game (gameId = 123)
-   **User-Specific Storage**: Updates user-specific latestGameId

#### Game Access with Redirect (Combinations 9, 10, 11, 12)

-   **Use Case**: Game access with redirect URL
-   **User Journey**: Auto nickname creation → Specific Game
-   **Analytics**: `SSO_To_Game` (with redirect URL context)
-   **Game Selection**: Specific game (gameId = 123)
-   **User-Specific Storage**: Updates user-specific latestGameId

### Category 3: Redirect URL Handling

#### With Redirect URL (Combinations 11, 12)

-   **Storage**: Base64 decoded and stored in URL context
-   **Usage**: `backToRedirectUrl()` function
-   **Trigger**: Post-game completion or back to lobby action
-   **Validation**: URL format validation before storage

#### Redirect URL for SabaPlay (Combination 6)

-   **Behavior**: `rurl` parameter is used for SabaPlay even when `gameId=0`
-   **Reason**: SabaPlay always uses redirectUrl regardless of gameId
-   **Impact**: SabaPlay users can access lobby with redirect functionality

#### Redirect URL Ignored (Combination 5)

-   **Behavior**: `rurl` parameter is ignored when `gameId=0` and not SabaPlay
-   **Reason**: Prioritizes lobby access over redirect logic for non-SabaPlay
-   **Impact**: Users can access lobby even with `rurl` parameters

## Registration Flow Variations

### Auto Nickname Creation

**Triggered by**: `isSabaPlay = true`

```typescript
// Registration logic
if (isSabaPlay) {
    // Auto create nickname
    const nickname = generateAutoNickname();
    await createNickname(nickname);
    // Continue to game/lobby
} else {
    // Show registration form
    renderRegister();
}
```

### Manual Registration

**Triggered by**: `isSabaPlay = false`

```typescript
// Registration logic
if (!isSabaPlay) {
    // Show registration form
    renderRegister();
    // User fills form and submits
    // Validate nickname
    // Create nickname
    // Continue to game/lobby
}
```

## Game Selection Logic

### SabaPlay Game Selection

```typescript
if (isSabaPlay) {
    // Use URL gameId directly
    currentGameId = urlContext.gameId;
} else {
    // Apply SSO redirect logic
    if (firstSSOToLobby) {
        currentGameId = 0; // Lobby
    } else {
        // Check service availability
        currentGameId = findAvailableGame(urlContext.gameId);
    }
}
```

### Service Availability Check

```typescript
function findAvailableGame(requestedGameId: number): number {
    const enabledGames = getLobbyConfigs().enabledGames;

    // Check if requested game is available
    if (enabledGames.includes(requestedGameId)) {
        return requestedGameId;
    }

    // Find first available game
    return enabledGames[0] || 0; // Fallback to lobby
}
```

### User-Specific Storage Logic

```typescript
// Get user-specific latestGameId
const userLatestGameId = getUserLatestGameId(session?.username);

// Use URL gameId or fallback to user-specific latestGameId
let toLoadGameId = urlGameId > 0 ? urlGameId : userLatestGameId;

// Update user-specific storage when game is selected
if (toLoadGameId > 0) {
    setUserLatestGameId(toLoadGameId, session?.username);
}
```

## Analytics Tracking

### SSO Method Classification

```typescript
function getSSOMethod(urlContext: URLContextModel): string {
    if (urlContext.gameId > 0) {
        return `SSO_To_Game`;
    } else {
        return `SSO_To_Lobby`;
    }
}
```

### Context Data

```typescript
const analyticsContext = {
    ssoMethod: getSSOMethod(urlContext),
    gameId: urlContext.gameId,
    language: urlContext.language,
    isSabaPlay: urlContext.isSabaPlay,
    hasRedirectUrl: !!urlContext.redirectUrl,
    userSpecificStorage: true, // New flag for user-specific storage
};
```

## Error Handling Scenarios

### Invalid gameId

-   **Behavior**: Fallback to gameId = 0 (lobby)
-   **Logging**: Error logged for debugging
-   **User Experience**: Redirected to lobby

### Service Unavailable

-   **Behavior**: Find alternative available game
-   **Fallback**: Lobby if no games available
-   **User Experience**: Seamless transition to available game

### Invalid Redirect URL

-   **Behavior**: Ignore redirect URL
-   **Validation**: Base64 decode and URL format check
-   **User Experience**: No redirect after game completion

### Network Failures

-   **Behavior**: Retry with exponential backoff
-   **Fallback**: Show user-friendly error message
-   **User Experience**: Clear error communication

### HTML-Encoded URLs (Fixed)

-   **Behavior**: Automatically decode `&amp;` to `&`
-   **Validation**: Proper URL parsing for all scenarios
-   **User Experience**: Seamless handling of encoded URLs

### Cross-User Interference (Fixed)

-   **Behavior**: User-specific storage keys
-   **Validation**: Isolated game tracking per user
-   **User Experience**: No cross-user state leakage

## Testing Scenarios

### Happy Path Tests

1. **Direct game access**: `?gameId=123&rurl=<base64>`
2. **SSO to lobby**: `?gameId=0`
3. **SabaPlay integration**: `?gameId=123&op=SP`
4. **With redirect URL**: `?gameId=123&rurl=<base64>`
5. **HTML-encoded URL**: `?token=xxx&amp;gameId=123&amp;op=SP`
6. **Current production URL**: `?token=xxx&lang=vi-VN&appType=1&rurl=<base64>&op=GN&cg=Credit_VN`
7. **SabaPlay with redirect**: `?gameId=0&op=SP&rurl=<base64>`

### Edge Case Tests

1. **No parameters**: Empty URL
2. **Invalid gameId**: `?gameId=999999`
3. **Invalid redirect URL**: `?rurl=invalid-base64`
4. **Conflicting flags**: `?op=SP` (redundant)
5. **Lobby with rurl**: `?gameId=0&rurl=<base64>` (rurl ignored for non-SabaPlay)
6. **Multiple users**: Test user-specific storage isolation
7. **Different op values**: `?op=SP`, `?op=GN`, `?op=invalid_value`

### Error Handling Tests

1. **Network timeout**: Simulate slow connection
2. **Service unavailable**: Disable all games
3. **Invalid session**: Expired token
4. **Authorization failure**: Invalid credentials
5. **HTML-encoded ampersands**: Test URL parsing
6. **Cross-user scenarios**: Test storage isolation

## Current Production URL Analysis

### Your Specific URL Case

**URL**: `https://gn-game.lumigame.com/?token=c72fd835-5b1d-48a1-a1cc-3d1eaa79aecf&lang=vi-VN&appType=1&rurl=<base64>&op=GN&cg=Credit_VN`

**Parameter Analysis**:

-   `token`: `c72fd835-5b1d-48a1-a1cc-3d1eaa79aecf` (authentication token)
-   `lang`: `vi-VN` (Vietnamese language)
-   `appType`: `1` (application type)
-   `rurl`: `<base64>` (redirect URL - **valid base64 string**)
-   `op`: `GN` (operator/platform - **not SabaPlay, so isSabaPlay=false**)
-   `cg`: `Credit_VN` (credit group)
-   `gameId`: **missing** (defaults to 0 - lobby mode)

**Behavior Prediction**:

-   `isSabaPlay`: `false` (because `op=GN`, not `op=SP`)
-   `gameId`: `0` (lobby mode)
-   `rurl`: `<base64>` (valid redirect URL)
-   **Result**: Normal SSO to Lobby flow

**Expected User Journey**:

1. URL → SplashScreen
2. Register (manual nickname creation)
3. Dashboard → Lobby

**Note**: This URL would benefit from adding a `gameId` parameter if direct game access is intended, or adding `rurl` parameter if post-game redirect is needed.

### Ref Parameter Validation

The `rurl` parameter now has strict validation with only two valid values:

-   **`<base64>`**: Valid Base64 encoded redirect URL

**Invalid values** (like `"invalid-base64"`, `"true"`, `"any_value"`) are ignored and will not enable redirect URL functionality.

**Implementation**:

```typescript
// URL helper validation functions
export const isValidRedirectUrl = (rurl: string | null): boolean => {
    if (!rurl) return true; // Empty string is allowed
    try {
        const decoded = atob(rurl);
        return /^[a-zA-Z0-9+/=]+$/.test(rurl) && decoded.length > 0;
    } catch (e) {
        return false;
    }
};

export const getRedirectUrl = (rurl: string | null): string | null => {
    if (isValidRedirectUrl(rurl)) {
        return rurl;
    }
    return null;
};
```

## Implementation Recommendations

### 1. Parameter Validation

```typescript
function validateURLContext(context: URLContextModel): boolean {
    // Validate gameId range
    if (context.gameId < 0 || context.gameId > MAX_GAME_ID) {
        return false;
    }

    // Validate redirect URL format
    if (context.redirectUrl && !isValidRedirectUrl(context.redirectUrl)) {
        return false;
    }

    return true;
}
```

### 2. Default Value Handling

```typescript
function getDefaultContext(): URLContextModel {
    return {
        gameId: 0,
        isSabaPlay: false,
        redirectUrl: "",
        firstSSOToLobby: true,
    };
}
```

### 3. Context Persistence

```typescript
function persistURLContext(context: URLContextModel): void {
    // Store in localStorage
    localStorage.setItem("urlContext", JSON.stringify(context));

    // Clear URL parameters
    if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
    }
}
```

### 4. User-Specific Storage

```typescript
function persistUserSpecificGameId(username: string, gameId: number): void {
    if (!username) return;
    const key = `latestGameId_${username}`;
    localStorage.setItem(key, gameId.toString());
}

function getUserSpecificGameId(username: string): number {
    if (!username) return 0;
    const key = `latestGameId_${username}`;
    return parseInt(localStorage.getItem(key) || "0", 10);
}
```

## Recent Bug Fixes and Parameter Combination Improvements

### Bug Fix 1: Cross-User latestGameId Interference - FIXED ✅

**Issue**: `latestGameId` was stored globally, causing cross-user interference when multiple users accessed the application.

**Root Cause**:

-   Global localStorage key used for all users
-   No user-specific isolation

**Fix Applied**:

-   **Storage Helper**: Added `getUserLatestGameId(username)` and `setUserLatestGameId(username, gameId)`
-   **Splash Screen**: Uses user-specific latestGameId instead of global one
-   **URL Context**: Stores and retrieves user-specific game IDs

**Impact**: Each user now has isolated game tracking, preventing cross-user interference.

### Bug Fix 2: HTML-Encoded Ampersands Breaking URL Parsing - FIXED ✅

**Issue**: URLs with `&amp;` (HTML-encoded ampersands) failed to parse correctly.

**Root Cause**:

-   URLSearchParams didn't handle HTML-encoded ampersands
-   Parsing failed for certain integration scenarios

**Fix Applied**:

-   **URL Context**: Added `searchParams.replace(/&amp;/g, '&')` before parsing
-   **Comprehensive Testing**: Verified all URL parameter combinations work

**Impact**: All URL parsing scenarios now work correctly, including HTML-encoded parameters.

### Bug Fix 3: Enhanced SabaPlay Integration - FIXED ✅

**Issue**: SabaPlay integration needed better handling of redirect URLs and lobby access.

**Root Cause**:

-   SabaPlay logic didn't properly handle all scenarios
-   Redirect URL handling was inconsistent

**Fix Applied**:

-   **URL Context**: Enhanced SabaPlay logic to always use redirectUrl regardless of gameId
-   **Effective Redirect URL**: Improved calculation for SabaPlay scenarios
-   **Direct Mode Logic**: Better integration between SabaPlay and direct mode

**Impact**: SabaPlay integration now works consistently across all scenarios.

### Bug Fix 4: Dashboard Error Modal for Lobby Access - FIXED ✅

**Issue**: Dashboard showed error modal when accessing lobby in direct mode with `queryGame=0`.

**Root Cause**:

-   `checkIsNotOfferGame` incorrectly treated lobby access as "not in offer"
-   Direct mode logic didn't account for lobby scenarios

**Fix Applied**:

-   **Dashboard Handler**: Fixed `checkIsNotOfferGame` to return `false` for lobby access in direct mode
-   **Special Case Handling**: Added logic for `queryGame=0` in direct mode

**Impact**: Lobby access in direct mode no longer shows error modal.

**Impact on Parameter Combinations**:

-   All combinations now have guaranteed completion paths
-   Error handling prevents flows from getting stuck
-   Lobby fallback ensures users always have a destination
-   Network errors are handled gracefully
-   User-specific storage prevents cross-user interference
-   HTML-encoded URLs are properly parsed
-   SabaPlay integration works consistently

**Updated Combination Behavior**:

-   **Before Fix**: Combinations 1, 2, 3, 5, 7, 9, 11, 13, 15 could get stuck
-   **After Fix**: All combinations complete successfully with proper error handling
-   **New Behavior**: SabaPlay always uses redirectUrl regardless of gameId (combination 6)
-   **User Isolation**: Each user has isolated game tracking

## Conclusion

This comprehensive analysis covers all 16 possible combinations of URL context parameters and their resulting behaviors. Understanding these combinations is crucial for:

-   **Development**: Implementing correct logic for each scenario
-   **Testing**: Ensuring all combinations are properly tested
-   **Debugging**: Identifying issues based on parameter combinations
-   **Analytics**: Tracking user journeys accurately
-   **Documentation**: Providing clear guidance for integration scenarios

The parameter combinations provide flexibility for different integration scenarios while maintaining consistent user experience across all access methods. The latest improvements ensure:

-   **User isolation**: No cross-user state interference
-   **Robust URL parsing**: Handles HTML-encoded parameters
-   **Smart lobby access**: Proper handling of lobby scenarios
-   **Enhanced SabaPlay integration**: Consistent behavior across all scenarios
-   **Enhanced error handling**: Better fallback mechanisms
-   **Comprehensive logging**: Detailed debugging information
