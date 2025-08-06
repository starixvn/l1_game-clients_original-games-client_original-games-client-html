# URL Context Flow Diagrams

## 1. Complete First Login to Lobby Flow

```mermaid
flowchart TD
    A1[User accesses application] --> B1[URL Context Parsing]
    B1 --> C1[Decode HTML-encoded ampersands]
    C1 --> D1{URL Parameters Present?}
    D1 -->|Yes| E1[Parse gameId, isDirectMode, redirectUrl, isSabaPlay]
    D1 -->|No| F1[Load from localStorage]

    E1 --> G1[Calculate effectiveRedirectUrl]
    G1 --> H1[Determine isDirectMode]
    H1 --> I1[Store in localStorage]
    F1 --> I1
    I1 --> J1[Clear URL parameters]
    J1 --> K1[SplashScreen Initialization]

    K1 --> L1[Get Session]
    L1 --> M1{Session Valid?}
    M1 -->|No| N1[Redirect to Timeout]
    M1 -->|Yes| O1{UM Session?}

    O1 -->|Yes| P1[Render UM Page]
    O1 -->|No| Q1[Authorize User]

    Q1 --> R1{User Authorized?}
    R1 -->|No| S1{isDirectMode or isSabaPlay?}
    R1 -->|Yes| T1[Load Lobby Configs]

    S1 -->|Yes| U1[Auto Create Nickname]
    S1 -->|No| V1[Render Register]

    U1 --> W1{Success?}
    W1 -->|No| N1
    W1 -->|Yes| T1

    T1 --> X1{isDirectMode?}
    X1 -->|Yes| Y1[Use URL gameId]
    X1 -->|No| Z1[Apply SSO Redirect Logic]

    Z1 --> AA1{firstSSOToLobby?}
    AA1 -->|Yes| BB1[Set gameId equals 0 Lobby]
    AA1 -->|No| CC1[Use user-specific latestGameId and Check Service]

    Y1 --> DD1[Set currentGameId]
    BB1 --> DD1
    CC1 --> DD1

    DD1 --> EE1[Custom Startup]
    EE1 --> FF1[Preload Resources]
    FF1 --> GG1[Render Dashboard]

    V1 --> HH1[User Registration]
    HH1 --> II1[Submit Form]
    II1 --> JJ1{isDirectMode?}
    JJ1 -->|Yes| KK1[Keep Original gameId]
    JJ1 -->|No| LL1[Update toLoadGameId]

    LL1 --> MM1{firstSSOToLobby?}
    MM1 -->|Yes| NN1[Set toLoadGameId equals 0]
    MM1 -->|No| OO1[Find Available Game]

    KK1 --> PP1[Trigger Preload]
    NN1 --> PP1
    OO1 --> PP1

    PP1 --> FF1
    FF1 --> GG1
```

## 2. URL Context Parameter Decision Tree

```mermaid
flowchart TD
    A2[URL Parameters] --> B2{op parameter?}
    B2 -->|SP| C2[isSabaPlay is true]
    B2 -->|Other or None| D2[isSabaPlay is false]

    C2 --> E2{gameId parameter?}
    E2 -->|Yes| F2[isDirectMode is true]
    E2 -->|No| G2[isDirectMode is false]

    D2 --> H2{ref parameter?}
    H2 -->|Yes| I2{gameId parameter?}
    H2 -->|No| J2[isDirectMode is false]

    I2 -->|Yes| K2{gameId equals 0?}
    I2 -->|No| L2[isDirectMode is false]

    K2 -->|Yes| M2[isDirectMode is false]
    K2 -->|No| N2{redirectUrl present?}
    N2 -->|Yes| O2[isDirectMode is true]
    N2 -->|No| P2[isDirectMode is false]

    F2 --> Q2[Use gameId directly]
    G2 --> R2[Apply SSO logic]
    J2 --> R2
    L2 --> R2
    M2 --> R2
    P2 --> R2
    O2 --> Q2

    R2 --> S2{firstSSOToLobby?}
    S2 -->|Yes| T2[Set gameId equals 0 lobby]
    S2 -->|No| U2[Use user-specific latestGameId]

    U2 --> V2{Service Available?}
    V2 -->|Yes| W2[Keep gameId]
    V2 -->|No| X2[Find Available Game]

    A2 --> Y2{rurl parameter?}
    Y2 -->|Present| Z2[redirectUrl equals rurl]
    Y2 -->|Not Present| AA2[redirectUrl is empty string]

    Z2 --> BB2{isSabaPlay?}
    BB2 -->|Yes| CC2[Always use redirectUrl]
    BB2 -->|No| DD2{gameId equals 0?}
    DD2 -->|Yes| EE2[redirectUrl is null]
    DD2 -->|No| FF2[Use redirectUrl]
```

## 3. Registration Flow Decision Matrix

```mermaid
flowchart TD
    A3[Register Component] --> B3[Initialize State]
    B3 --> C3[Set toLoadGameId equals gameId from props]
    C3 --> D3[User Fills Form]
    D3 --> E3[Submit Registration]
    E3 --> F3{Name Valid?}
    F3 -->|No| G3[Show Error]
    F3 -->|Yes| H3[Create Nickname]

    H3 --> I3{Success?}
    I3 -->|No| G3
    I3 -->|Yes| J3{isDirectMode?}

    J3 -->|Yes| K3[Keep Original gameId]
    J3 -->|No| L3[Call updateToLoadGameId]

    L3 --> M3[Get Lobby Configs]
    M3 --> N3{firstSSOToLobby?}
    N3 -->|Yes| O3[Set toLoadGameId equals 0]
    N3 -->|No| P3[Find Available Game Service]

    P3 --> Q3{Service Available?}
    Q3 -->|Yes| R3[Set toLoadGameId equals Available Game]
    Q3 -->|No| S3[Set toLoadGameId equals 0 Lobby]

    K3 --> T3[Trigger Preload Resources]
    O3 --> T3
    R3 --> T3
    S3 --> T3

    T3 --> U3{toLoadGameId equals 0?}
    U3 -->|Yes| V3[Skip Preload, Render Dashboard]
    U3 -->|No| W3[Preload Resources]

    V3 --> X3[Render Dashboard]
    W3 --> X3
```

## 4. Dashboard Rendering Logic Flow

```mermaid
flowchart TD
    A4[Dashboard Constructor] --> B4[Initialize with queryGame]
    B4 --> C4[componentDidMount]
    C4 --> D4{queryGame greater than 0?}
    D4 -->|Yes| E4[openGame queryGame]
    D4 -->|No| F4[Render Lobby]

    E4 --> G4[Set State: queryGame, openGameId]
    G4 --> H4[Update URL Context]
    H4 --> I4[shouldRenderGames Check]

    I4 --> J4{openGameId greater than 0 and offerGames includes?}
    J4 -->|Yes| K4[Render Games]
    J4 -->|No| L4[Render Lobby]

    F4 --> M4[Update URL Context: backToLobby]
    M4 --> L4

    L4 --> N4[Lobby Component]
    N4 --> O4[User Clicks Game]
    O4 --> P4[openGameFromLobby]
    P4 --> Q4{GameId Different?}
    Q4 -->|Yes| R4[Remove Game Transmitter]
    Q4 -->|No| S4[Force Update]

    R4 --> T4[Set openGameId]
    S4 --> T4
    T4 --> U4[Update URL Context]
    U4 --> I4
```

## 5. URL Context State Management Flow

```mermaid
flowchart TD
    A5[URL Context Update] --> B5[updateURLContext]
    B5 --> C5[Get Context from localStorage]
    C5 --> D5{gameId Present?}
    D5 -->|Yes| E5[Update user-specific latestGameId]
    D5 -->|No| F5[Skip gameId Update]

    E5 --> G5[Store in localStorage with username key]
    F5 --> G5
    G5 --> H5[Set firstSSOToLobby equals false]
    H5 --> I5[Store Updated Context]

    A5 --> J5[Load URL Context]
    J5 --> K5[loadURLContext]
    K5 --> L5{Context from URL?}
    L5 -->|Yes| M5[Parse URL Parameters]
    L5 -->|No| N5[Load from localStorage]

    M5 --> O5[Store in localStorage]
    N5 --> O5
    O5 --> P5[Clear URL Parameters]
    P5 --> Q5[Return Context]
```

## 6. Service Availability Check Flow

```mermaid
flowchart TD
    A6[Service Availability Check] --> B6[Get Enabled Game Settings]
    B6 --> C6{firstSSOToLobby?}
    C6 -->|Yes| D6[Set gameId equals 0 Lobby]
    C6 -->|No| E6{user-specific latestGameId greater than 0?}

    E6 -->|No| F6[Find First Available Game]
    E6 -->|Yes| G6[Check user-specific latestGameId Service]

    G6 --> H6{Service Available?}
    H6 -->|Yes| I6[Use user-specific latestGameId]
    H6 -->|No| F6

    F6 --> J6[Iterate Game Settings]
    J6 --> K6{Service Available?}
    K6 -->|Yes| L6[Set to Available Game]
    K6 -->|No| M6{More Games?}

    M6 -->|Yes| J6
    M6 -->|No| N6[Set gameId equals 0 Lobby]

    D6 --> O6[Return gameId]
    I6 --> O6
    L6 --> O6
    N6 --> O6
```

## 7. Auto Nickname Creation Flow

```mermaid
flowchart TD
    A7[Auto Nickname Creation] --> B7{isDirectMode or isSabaPlay?}
    B7 -->|Yes| C7[Generate Random Name]
    B7 -->|No| D7[Show Registration Form]

    C7 --> E7[Generate Random Avatar]
    E7 --> F7[Call createNickname API]
    F7 --> G7{Success?}
    G7 -->|No| H7[Sign Out]
    G7 -->|Yes| I7[Set User Settings]

    I7 --> J7[Update Sign In Status]
    J7 --> K7[Continue to Game or Lobby]

    D7 --> L7[User Fills Form]
    L7 --> M7[Submit Registration]
    M7 --> N7{Success?}
    N7 -->|No| O7[Show Error]
    N7 -->|Yes| K7

    O7 --> L7
```

## 8. User-Specific Storage Flow

```mermaid
flowchart TD
    A8[User-Specific Storage] --> B8{Username Available?}
    B8 -->|Yes| C8[Create User-Specific Key]
    B8 -->|No| D8[Use Global Key]

    C8 --> E8[Store/Retrieve with Username Prefix]
    D8 --> F8[Store/Retrieve with Global Key]

    E8 --> G8[Isolated User Data]
    F8 --> H8[Global Data]

    G8 --> I8[No Cross-User Interference]
    H8 --> J8[Fallback for Anonymous Users]

    A8 --> K8[Update latestGameId]
    K8 --> L8{Username Present?}
    L8 -->|Yes| M8[Set User-Specific latestGameId]
    L8 -->|No| N8[Set Global latestGameId]

    M8 --> O8[User-Specific Storage Key]
    N8 --> P8[Global Storage Key]

    O8 --> Q8[Isolated Game Tracking]
    P8 --> R8[Global Game Tracking]
```

## 9. HTML-Encoded URL Handling Flow

```mermaid
flowchart TD
    A9[HTML-Encoded URL Handling] --> B9[Get Raw Search Parameters]
    B9 --> C9{Contains &amp;?}
    C9 -->|Yes| D9[Replace &amp; with &]
    C9 -->|No| E9[Use Raw Parameters]

    D9 --> F9[Decode HTML Entities]
    E9 --> F9
    F9 --> G9[Parse URL Parameters]

    G9 --> H9[Extract All Parameters]
    H9 --> I9[Calculate Direct Mode]
    I9 --> J9[Return Context]

    A9 --> K9[URL Parameter Validation]
    K9 --> L9{Valid Parameters?}
    L9 -->|Yes| M9[Process Parameters]
    L9 -->|No| N9[Use Default Values]

    M9 --> O9[Create URL Context]
    N9 --> P9[Create Default Context]

    O9 --> Q9[Store in localStorage]
    P9 --> Q9
    Q9 --> R9[Clear URL Parameters]
```

## 10. Enhanced Direct Mode Logic Flow

```mermaid
flowchart TD
    A10[Enhanced Direct Mode Logic] --> B10[Parse URL Parameters]
    B10 --> C10[Extract gameId, ref, rurl, op]
    C10 --> D10{isSabaPlay?}
    D10 -->|Yes| E10[Always use redirectUrl]
    D10 -->|No| F10{gameId equals 0?}
    F10 -->|Yes| G10[Set redirectUrl to null]
    F10 -->|No| H10[Use redirectUrl as is]

    E10 --> I10[Calculate effectiveRedirectUrl]
    G10 --> I10
    H10 --> I10

    I10 --> J10{ref present AND effectiveRedirectUrl?}
    J10 -->|Yes| K10[Direct Mode from ref]
    J10 -->|No| L10{isSabaPlay AND gameId > 0?}
    L10 -->|Yes| M10[Direct Mode from SabaPlay]
    L10 -->|No| N10[Not Direct Mode]

    K10 --> O10[isDirectMode = true]
    M10 --> O10
    N10 --> P10[isDirectMode = false]

    O10 --> Q10[Skip SSO Logic]
    P10 --> R10[Apply SSO Logic]

    Q10 --> S10[Use URL gameId directly]
    R10 --> T10[Apply Business Rules]
```

## 11. Recent Bug Fixes and Flow Improvements

### Bug Fix: Registration Flow Getting Stuck

**Issue**: New users with URLs like `?token=xxx&lang=vi-VN&appType=1&op=GN&cg=Credit_VN` (missing gameId, non-direct mode, non-SabaPlay) would get stuck after registration completion.

**Root Cause**:

1. `PreloadResourceRegister.handleAuthorizedAccess` was not calling `updateStatePreloadResource()` when lobby configs were successfully loaded
2. `Register.updateToLoadGameId` had no fallback when no enabled games were available

**Fix Applied**:

#### 1. PreloadResourceRegister Fix

```typescript
const handleAuthorizedAccess = async () => {
    try {
        const lobby = await getLobbyConfigs(session);
        if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
            updateStatePreloadResource();
        } else {
            if (lobby?.lobbyConfigs) {
                updateLobbyConfigs(lobby?.lobbyConfigs);
                getAndHandleBannerOffer(authorizeResponse, lobby?.lobbyConfigs, setBannerId);
                getAndHandleGameOfferIds(authorizeResponse, lobby?.lobbyConfigs, setGameOfferIds);
                // Fix: Call updateStatePreloadResource when lobby configs are successfully loaded
                updateStatePreloadResource();
            }
        }
    } catch (error) {
        console.error(error);
        // Fix: Call updateStatePreloadResource even on error to prevent getting stuck
        updateStatePreloadResource();
    }
};
```

#### 2. Register updateToLoadGameId Fix

```typescript
updateToLoadGameId = async (authorizeResponse: AuthorizeResponse) => {
    const lobby = await getLobbyConfigs(session);
    const enabledRenderGameSettings = getEnabledRenderGameSettings(lobby?.lobbyConfigs, authorizeResponse);

    if (firstSSOToLobby && enabledRenderGameSettings.length > 0) {
        this.setState({ toLoadGameId: 0 });
    } else if (enabledRenderGameSettings.length > 0) {
        for (const gameSetting of enabledRenderGameSettings) {
            const isServiceAvailable = await getServiceStatusIsAvailable(gameSetting);
            if (isServiceAvailable) {
                this.setState({ toLoadGameId: gameSetting.id });
                break;
            }
        }
    } else {
        // Fix: Handle case when no enabled games are available - default to lobby
        this.setState({ toLoadGameId: 0 });
    }
};
```

**Impact on Flow Diagrams**:

-   All registration flows now have a guaranteed path to completion
-   Error handling prevents flows from getting stuck
-   Lobby fallback ensures users always have a destination
-   Network errors are handled gracefully

**Updated Flow Behavior**:

-   **Before Fix**: Flows could get stuck when lobby configs loaded successfully
-   **After Fix**: All flows complete successfully with proper error handling

## 12. Back to Lobby Flow

```mermaid
flowchart TD
    A12[Back to Lobby Action] --> B12{redirectUrl Present?}
    B12 -->|Yes| C12[Decode redirectUrl]
    B12 -->|No| D12[Update URL Context]

    C12 --> E12[Redirect to Decoded URL]
    D12 --> F12[Set gameId equals 0]
    F12 --> G12[Set backToLobby equals true]
    G12 --> H12[Broadcast BACK_TO_LOBBY]

    H12 --> I12[Dashboard resetGameIdDashboardEvent]
    I12 --> J12[Set openGameId equals 0]
    J12 --> K12[Force Update]
    K12 --> L12[Render Lobby]
```

## 13. Analytics Tracking Flow

```mermaid
flowchart TD
    A13[Analytics Login] --> B13[Get URL Context]
    B13 --> C13{isDirectMode?}
    C13 -->|Yes| D13[ssoMethod is SSO_Direct_Mode_To_Game]
    C13 -->|No| E13{gameId greater than 0?}

    E13 -->|Yes| F13[ssoMethod is SSO_To_Game]
    E13 -->|No| G13[ssoMethod is SSO_To_Lobby]

    D13 --> H13[Set Analytics Context]
    F13 --> H13
    G13 --> H13

    H13 --> I13[Track gameId]
    I13 --> J13[Track language]
    J13 --> K13[Track gameName if gameId greater than 0]
```

## 14. Error Handling Flow

```mermaid
flowchart TD
    A14[Error Handling] --> B14{Error Type?}
    B14 -->|Invalid gameId| C14[Set gameId equals 0]
    B14 -->|Service Unavailable| D14[Find Alternative Game]
    B14 -->|Authorization Failure| E14[Redirect to Timeout]
    B14 -->|Network Error| F14[Retry with Backoff]

    C14 --> G14[Log Error]
    D14 --> H14{Alternative Found?}
    H14 -->|Yes| I14[Use Alternative Game]
    H14 -->|No| C14

    E14 --> J14[Clear Session]
    F14 --> K14{Max Retries?}
    K14 -->|No| L14[Retry Request]
    K14 -->|Yes| M14[Show Error Message]

    G14 --> N14[Continue Flow]
    I14 --> N14
    J14 --> O14[End Session]
    L14 --> F14
    M14 --> P14[User Action Required]
```

These diagrams provide a comprehensive visual representation of how the URL context parameters interact throughout the first login to lobby flow, helping developers understand the complex decision-making logic and state management involved in the application. The latest improvements ensure:

-   **User isolation**: No cross-user state interference
-   **Robust URL parsing**: Handles HTML-encoded parameters
-   **Smart lobby access**: Proper handling of lobby scenarios
-   **Enhanced SabaPlay integration**: Consistent behavior across all scenarios
-   **Enhanced error handling**: Better fallback mechanisms
-   **Comprehensive logging**: Detailed debugging information
