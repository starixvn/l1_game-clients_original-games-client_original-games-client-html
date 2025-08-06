# URL Parameter Redundancy Handling Guide

## Overview

This guide addresses the redundancy between `rurl` (redirect URL) and `op=SP` (SabaPlay) URL parameters and provides solutions for handling these combinations effectively.

## 🚨 Latest Updates (Latest Version)

### Key Improvements Applied

**1. Enhanced Redirect URL Logic**

-   **Change**: Redirect URL calculation now properly handles lobby access
-   **Implementation**: `effectiveRedirectUrl = gameId === 0 ? null : redirectUrl`
-   **Impact**: Allows lobby access even when `rurl` parameters are present

**2. User-Specific Storage**

-   **Change**: `latestGameId` is now stored per user using username-based keys
-   **Implementation**: `getUserLatestGameId(username)` and `setUserLatestGameId(username, gameId)`
-   **Impact**: Prevents cross-user state leakage and ensures proper game tracking

**3. HTML-Encoded Ampersands Handling**

-   **Change**: URLs with `&amp;` are now properly decoded before parsing
-   **Implementation**: `searchParams.replace(/&amp;/g, '&')` before parsing
-   **Impact**: Fixes URL parsing issues in various integrations

## Problem Statement

### Redundant Combinations Identified

Based on the URL Parameter Combinations Matrix, the following combinations are redundant:

| Combination | URL Example                       | Issue                   | Behavior                  |
| ----------- | --------------------------------- | ----------------------- | ------------------------- |
| 4           | `?gameId=0&rurl=<base64>&op=SP`   | Redundant SabaPlay flag | Both support redirect URL |
| 6           | `?gameId=0&rurl=<base64>&op=SP`   | Redundant SabaPlay flag | Both support redirect URL |
| 10          | `?gameId=123&rurl=<base64>&op=SP` | Redundant SabaPlay flag | Both support redirect URL |
| 12          | `?gameId=123&rurl=<base64>&op=SP` | Redundant SabaPlay flag | Both support redirect URL |
| 16          | `?rurl=<base64>&op=SP`            | Redundant flags         | Both support redirect URL |

### Your Specific Case

**URL**: `http://localhost:3000?token=d5548fbd-06d9-4b23-aff2-b8731a88916e&lang=vi-VN&appType=1&rurl=<base64>&op=GN&cg=Credit_VN`

**Analysis**:

-   `rurl=<base64>` → `redirectUrl = <decoded_url>` (if `gameId > 0`)
-   `op=GN` → `isSabaPlay = false` (only `op=SP` sets this to true)
-   **Result**: No redundancy in this case
-   **Issue**: Missing `rurl` parameter for post-game redirect

## Enhanced URL Context Solution

### 1. Updated Parameter Parsing

```typescript
// Enhanced redirect URL logic with smart calculation
let searchParams = globalThis.location?.search;

// Fix: Handle HTML-encoded ampersands
if (searchParams) {
    searchParams = searchParams.replace(/&amp;/g, "&");
}

const params = new URLSearchParams(searchParams);
const redirectUrl = params.get("rurl");
const isSabaPlay = params.get("op") === "SP";
const gameId = Number(params.get("gameId") || 0);

// Enhanced redirect URL logic
const effectiveRedirectUrl = gameId === 0 ? null : redirectUrl;

// Detect redundant combinations
const isRedundantCombination = redirectUrl && isSabaPlay;

// Determine effective mode for business logic
let effectiveMode: "redirect" | "sabaplay" | "normal" = "normal";
if (isRedundantCombination) {
    // When both are present, prioritize redirect URL for navigation logic
    // but keep SabaPlay for UI/branding purposes
    effectiveMode = "redirect";
} else if (redirectUrl) {
    effectiveMode = "redirect";
} else if (isSabaPlay) {
    effectiveMode = "sabaplay";
}
```

### 2. User-Specific Storage Integration

```typescript
// User-specific latestGameId handling
const getUserSpecificGameId = (username: string): number => {
    if (!username) return 0;
    const key = `${localStorageKeys.latestGameId}_${username}`;
    return StorageHelper.get(key) || 0;
};

const setUserSpecificGameId = (username: string, gameId: number): void => {
    if (!username) return;
    const key = `${localStorageKeys.latestGameId}_${username}`;
    StorageHelper.set(key, gameId);
};

// Enhanced game selection logic with user-specific storage
const getEffectiveGameId = (urlContext: URLContextModel, username: string): number => {
    if (urlContext.redirectUrl && urlContext.gameId > 0) {
        return urlContext.gameId; // Use URL gameId directly
    } else {
        // Use user-specific latestGameId for SSO logic
        const userLatestGameId = getUserSpecificGameId(username);
        return urlContext.gameId > 0 ? urlContext.gameId : userLatestGameId;
    }
};
```

### 3. Utility Functions for Redundancy Handling

```typescript
/**
 * Determines if auto nickname creation should be triggered
 */
export function shouldAutoCreateNickname(context: URLContextModel): boolean {
    return !!context.isSabaPlay;
}

/**
 * Determines the effective game selection mode
 */
export function getGameSelectionMode(context: URLContextModel): "redirect" | "sso" {
    // Redirect mode always bypasses SSO logic, even when redundant with SabaPlay
    return context.redirectUrl && context.gameId > 0 ? "redirect" : "sso";
}

/**
 * Validates if the URL combination is redundant and provides recommendations
 */
export function validateURLCombination(context: URLContextModel): {
    isValid: boolean;
    isRedundant: boolean;
    recommendations: string[];
    warnings: string[];
} {
    const isRedundant = context.redirectUrl && context.isSabaPlay;
    const warnings = [];
    const recommendations = [];

    if (isRedundant) {
        warnings.push("Redundant combination: both rurl and op=SP parameters present");
        recommendations.push("Use either rurl OR op=SP, not both");
        recommendations.push("Consider using op=SP for SabaPlay integration");
    }

    if (context.gameId === 0 && context.redirectUrl) {
        warnings.push("Redirect URL ignored when accessing lobby (gameId=0)");
        recommendations.push("Remove rurl parameter when accessing lobby");
    }

    return {
        isValid: true,
        isRedundant,
        recommendations,
        warnings,
    };
}
```

## Recommended URL Patterns

### 1. Direct Access (Recommended)

```
?rurl=<base64-encoded-url>&gameId=123
```

-   **Use Case**: Direct game access from external systems
-   **Behavior**: Bypasses SSO logic, uses URL gameId directly
-   **Redirect**: Supports post-game redirect via rurl
-   **User Storage**: Updates user-specific latestGameId

### 2. SabaPlay Integration (Recommended)

```
?op=SP&rurl=<base64-encoded-url>
```

-   **Use Case**: SabaPlay platform integration
-   **Behavior**: Applies SSO logic, platform-specific UI
-   **Redirect**: Supports post-game redirect via rurl
-   **User Storage**: Updates user-specific latestGameId

### 3. Lobby Access (Fixed)

```
?gameId=0&rurl=<base64>  // rurl ignored, lobby access allowed
?gameId=0&op=SP&rurl=<base64>     // rurl ignored, lobby access allowed
```

## Implementation Guidelines

### 1. Business Logic Decisions

```typescript
// Auto nickname creation
if (shouldAutoCreateNickname(urlContext)) {
    console.log(`Auto creating nickname - SabaPlay: ${urlContext.isSabaPlay}`);
    authorizeInfo = await autoCreateNickname(session, signOut);
}

// Game selection logic with user-specific storage
const gameSelectionMode = getGameSelectionMode(urlContext);
if (gameSelectionMode === "redirect") {
    currentGameId = urlContext.gameId; // Use URL gameId directly
} else {
    // Use user-specific latestGameId for SSO logic
    const userLatestGameId = getUserSpecificGameId(session?.username);
    currentGameId = applySSOLogic(urlContext.gameId || userLatestGameId);
}

// Update user-specific storage when game is selected
if (currentGameId > 0) {
    setUserSpecificGameId(session?.username, currentGameId);
}

// Analytics tracking
const analyticsMethod = getAnalyticsMethod(urlContext);
```

### 2. Validation and Warnings

```typescript
// Validate URL combination
const validation = validateURLCombination(urlContext);
if (validation.isRedundant) {
    console.warn("Redundant URL parameters detected:", validation.warnings);
    console.log("Recommendations:", validation.recommendations);
}

// Validate HTML-encoded URLs
if (urlContext.redirectUrl && urlContext.redirectUrl.includes("&amp;")) {
    console.warn("HTML-encoded ampersands detected in redirect URL");
}
```

### 3. Redirect URL Handling

```typescript
// Enhanced redirect URL support with HTML-encoded handling
if (urlContext.redirectUrl) {
    try {
        // Store for post-game redirect
        const decodedUrl = GameUtils.base64Decode(urlContext.redirectUrl);
        console.log("Post-game redirect URL:", decodedUrl);
    } catch (error) {
        console.error("Failed to decode redirect URL:", error);
        urlContext.redirectUrl = "";
    }
}
```

## Migration Strategy

### Phase 1: Backward Compatibility

-   Keep existing logic working
-   Add redundancy detection and warnings
-   Support rurl for both direct mode and SabaPlay
-   Implement user-specific storage

### Phase 2: Documentation and Training

-   Update integration documentation
-   Train partners on recommended URL patterns
-   Provide migration examples
-   Document HTML-encoded URL handling

### Phase 3: Enforcement (Optional)

-   Add validation to reject redundant combinations
-   Implement URL parameter cleaning
-   Monitor usage patterns
-   Ensure user-specific storage isolation

## Testing Scenarios

### 1. Your Specific Case

```typescript
// Test URL: ?op=GN
const context = parseContextFromURL();
expect(context.isSabaPlay).toBe(false);
expect(context.isRedundantCombination).toBe(false);
expect(context.effectiveMode).toBe("normal");
```

### 2. Redundant Combination

```typescript
// Test URL: ?op=SP&gameId=123&rurl=<base64>
const context = parseContextFromURL();
expect(context.isSabaPlay).toBe(true);
expect(context.redirectUrl).toBe("<base64>");
expect(context.isRedundantCombination).toBe(true);
expect(context.effectiveMode).toBe("redirect");
```

### 3. SabaPlay with Redirect

```typescript
// Test URL: ?op=SP&rurl=<base64>
const context = parseContextFromURL();
expect(context.isSabaPlay).toBe(true);
expect(context.redirectUrl).toBe("<base64>");
expect(context.effectiveMode).toBe("sabaplay");
```

### 4. HTML-Encoded URL

```typescript
// Test URL: ?token=test&amp;gameId=123&amp;op=SP
const context = parseContextFromURL();
expect(context.token).toBe("test");
expect(context.gameId).toBe(123);
expect(context.isSabaPlay).toBe(true);
```

### 5. User-Specific Storage

```typescript
// Test multiple users
const user1 = "user1";
const user2 = "user2";
const gameId1 = 123;
const gameId2 = 456;

setUserSpecificGameId(user1, gameId1);
setUserSpecificGameId(user2, gameId2);

expect(getUserSpecificGameId(user1)).toBe(gameId1);
expect(getUserSpecificGameId(user2)).toBe(gameId2);
expect(getUserSpecificGameId(user1)).not.toBe(getUserSpecificGameId(user2));
```

## Best Practices

### 1. URL Parameter Guidelines

-   **Use `rurl`** for direct access scenarios with redirect
-   **Use `op=SP`** for SabaPlay platform integration
-   **Always include `rurl`** when post-game redirect is needed
-   **Avoid combining both** `rurl` and `op=SP` in the same URL
-   **Handle HTML-encoded ampersands** properly
-   **Use user-specific storage** for game tracking

### 2. Integration Examples

#### Direct Game Access

```
https://game.example.com?token=<token>&gameId=123&rurl=<base64-encoded-redirect>
```

#### SabaPlay Integration

```
https://game.example.com?token=<token>&op=SP&gameId=123&rurl=<base64-encoded-redirect>
```

#### Lobby Access (Fixed)

```
https://game.example.com?token=<token>&gameId=0&rurl=<base64>  // rurl ignored
https://game.example.com?token=<token>&gameId=0&op=SP&rurl=<base64>     // rurl ignored
```

#### HTML-Encoded URLs

```
https://game.example.com?token=test&amp;gameId=123&amp;op=SP  // Properly handled
```

### 3. Error Handling

```typescript
// Handle invalid redirect URLs
if (urlContext.redirectUrl) {
    try {
        const decodedUrl = GameUtils.base64Decode(urlContext.redirectUrl);
        if (!isValidURL(decodedUrl)) {
            console.warn("Invalid redirect URL format");
            urlContext.redirectUrl = "";
        }
    } catch (error) {
        console.error("Failed to decode redirect URL:", error);
        urlContext.redirectUrl = "";
    }
}

// Handle missing username for user-specific storage
if (!session?.username) {
    console.warn("No username available for user-specific storage");
    // Fallback to global storage or default behavior
}
```

## Conclusion

The enhanced URL context solution provides:

1. **Backward Compatibility**: Existing URLs continue to work
2. **Redundancy Detection**: Clear identification of redundant combinations
3. **Enhanced Functionality**: Support for rurl in both direct mode and SabaPlay
4. **Smart Lobby Access**: Proper handling of lobby access with redirect parameters
5. **User-Specific Storage**: Isolated game tracking per user
6. **HTML-Encoded URL Support**: Proper handling of encoded ampersands
7. **Clear Guidelines**: Recommended URL patterns for different use cases
8. **Validation Tools**: Utilities to validate and clean URL combinations

This approach maintains flexibility while providing clear guidance for avoiding redundancy and ensuring proper functionality across all integration scenarios. The latest improvements ensure better user isolation, more robust URL parsing, and smarter lobby access handling.
