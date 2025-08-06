# URL Context Flow Diagrams

## 1. Complete First Login to Lobby Flow

```mermaid
flowchart TD
    A1[User accesses application] --> B1[URL Context Parsing]
    B1 --> C1[Decode HTML-encoded ampersands]
    C1 --> D1{URL Parameters Present?}
    D1 -->|Yes| E1[Parse gameId, redirectUrl, isSabaPlay]
    D1 -->|No| F1[Load from localStorage]

    E1 --> G1[Calculate effectiveRedirectUrl]
    G1 --> H1[Store in localStorage]
    F1 --> H1
    H1 --> I1[Clear URL parameters]
    I1 --> J1[SplashScreen Initialization]

    J1 --> K1[Get Session]
    K1 --> L1{Session Valid?}
    L1 -->|No| M1[Redirect to Timeout]
    L1 -->|Yes| N1{UM Session?}

    N1 -->|Yes| O1[Render UM Page]
    N1 -->|No| P1[Authorize User]

    P1 --> Q1{User Authorized?}
    Q1 -->|No| R1{isSabaPlay?}
    Q1 -->|Yes| S1[Load Lobby Configs]

    R1 -->|Yes| T1[Auto Create Nickname]
    R1 -->|No| U1[Render Register]

    T1 --> V1{Success?}
    V1 -->|No| M1
    V1 -->|Yes| S1

    S1 --> W1{gameId > 0?}
    W1 -->|Yes| X1[Use URL gameId]
    W1 -->|No| Y1[Apply SSO Redirect Logic]

    Y1 --> Z1{firstSSOToLobby?}
    Z1 -->|Yes| AA1[Set gameId equals 0 Lobby]
    Z1 -->|No| BB1[Use user-specific latestGameId and Check Service]

    X1 --> CC1[Set currentGameId]
    AA1 --> CC1
    BB1 --> CC1

    CC1 --> DD1[Custom Startup]
    DD1 --> EE1[Preload Resources]
    EE1 --> FF1[Render Dashboard]

    U1 --> GG1[User Registration]
    GG1 --> HH1[Submit Form]
    HH1 --> II1{redirectUrl present?}
    II1 -->|Yes| JJ1[Keep Original gameId]
    II1 -->|No| KK1[Update toLoadGameId]

    KK1 --> LL1{firstSSOToLobby?}
    LL1 -->|Yes| MM1[Set toLoadGameId equals 0]
    LL1 -->|No| NN1[Find Available Game]

    JJ1 --> OO1[Trigger Preload]
    MM1 --> OO1
    NN1 --> OO1

    OO1 --> EE1
    EE1 --> FF1
```

## 2. URL Context Parameter Decision Tree

```mermaid
flowchart TD
    A2[URL Parameters] --> B2{op parameter?}
    B2 -->|SP| C2[isSabaPlay is true]
    B2 -->|Other or None| D2[isSabaPlay is false]

    C2 --> E2{gameId parameter?}
    E2 -->|Yes| F2[Use gameId directly]
    E2 -->|No| G2[Apply SSO logic]

    D2 --> H2{gameId parameter?}
    H2 -->|Yes| I2{gameId equals 0?}
    H2 -->|No| J2[Apply SSO logic]

    I2 -->|Yes| K2[Apply SSO logic]
    I2 -->|No| L2{redirectUrl present?}
    L2 -->|Yes| M2[Use gameId directly]
    L2 -->|No| N2[Apply SSO logic]

    F2 --> O2[Use gameId directly]
    G2 --> P2[Apply SSO logic]
    J2 --> P2
    K2 --> P2
    N2 --> P2
    M2 --> O2

    P2 --> Q2{firstSSOToLobby?}
    Q2 -->|Yes| R2[Set gameId equals 0 lobby]
    Q2 -->|No| S2[Use user-specific latestGameId]

    S2 --> T2{Service Available?}
    T2 -->|Yes| U2[Keep gameId]
    T2 -->|No| V2[Find Available Game]

    A2 --> W2{rurl parameter?}
    W2 -->|Present| X2[redirectUrl equals rurl]
    W2 -->|Not Present| Y2[redirectUrl is empty string]

    X2 --> Z2{isSabaPlay?}
    Z2 -->|Yes| AA2[Always use redirectUrl]
    Z2 -->|No| BB2{gameId equals 0?}
    BB2 -->|Yes| CC2[redirectUrl is null]
    BB2 -->|No| DD2[Use redirectUrl]
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
    I3 -->|Yes| J3{redirectUrl present?}

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
    A7[Auto Nickname Creation] --> B7{isSabaPlay?}
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

    I10 --> J10{redirectUrl present AND gameId > 0?}
    J10 -->|Yes| K10[Game Access with Redirect]
    J10 -->|No| L10{isSabaPlay AND gameId > 0?}
    L10 -->|Yes| M10[Game Access from SabaPlay]
    L10 -->|No| N10[Normal SSO Flow]

    K10 --> O10[Use URL gameId directly]
    M10 --> O10
    N10 --> P10[Apply SSO Logic]

    O10 --> Q10[Skip SSO Logic]
    P10 --> R10[Apply Business Rules]

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
    B13 --> C13{gameId greater than 0?}
    C13 -->|Yes| D13[ssoMethod is SSO_To_Game]
    C13 -->|No| E13[ssoMethod is SSO_To_Lobby]

    D13 --> F13[Set Analytics Context]
    E13 --> F13

    F13 --> G13[Track gameId]
    G13 --> H13[Track language]
    H13 --> I13[Track gameName if gameId greater than 0]
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
