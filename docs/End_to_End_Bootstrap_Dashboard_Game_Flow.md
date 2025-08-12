### End-to-End App Flow: URL → Splash → Preload → Dashboard → Game Mount (SeDieMultiplayer)

This document describes the observed runtime flow from initial URL parsing through SplashScreen initialization, resource preloading, Dashboard rendering, and final game mount for `gameId=148` (SeDieMultiplayer). It is derived from the provided console logs.

---

### Overview

-   **Input context**: `?token=<uuid>&appType=1`, persisted `gameId=148`
-   **Language**: `vi`
-   **Preload**: 126 critical images in 26 batches, 100% completion, cached
-   **Dashboard**: Offer check bypassed due to explicit query game (SeDie)
-   **Game**: `SeDieMultiplayer` mounted via `GameBase`; in-game preload is a cache hit
-   **Analytics**: login, setUser, SSO event, page_view, function_event JoinGame:Show

---

### Sequence Diagram

```mermaid
sequenceDiagram
autonumber
participant B as Browser/Router
participant UC as URLContext
participant SS as SplashScreen
participant AH as AnalyticsHelper
participant PM as PreloadManager
participant API as Preload API
participant C as Cache
participant D as Dashboard
participant DH as DashboardHandler
participant G as Games
participant GB as GameBase
participant SR as ScoreboardRegistry
participant UI as UserInfo

B->>UC: loadURLContext
UC->>UC: parseContextFromURL token, appType=1
UC-->>B: context token, gameId=148, language=null
B->>SS: mount render
SS->>SS: getSession => true
SS->>SS: loadLanguage => vi
SS->>AH: login(urlContext)
SS->>SS: loadLobbyConfigs ok
SS-->>SS: validate toLoadGameId=148 available=true
SS->>PM: start preload key 148-vi-0
PM->>API: GET /api/preload-images
API-->>PM: 126 image paths (78ms)
PM->>C: progressive load 26 batches (critical=126)
PM-->>SS: progress 0%..100%
SS->>AH: setUser, sso_event
SS-->>B: isRenderDashboard true
B->>D: render Dashboard
D->>DH: getOfferGamesIds
D->>D: checkGameOffer bypass (SeDie)
D->>D: openGame 148 + updateURLContext
D->>G: render Games (openGameId 148)
G->>G: getGameComponentById => SeDieMultiPlayer
G->>GB: mount GameBase 148
GB->>PM: start preload for game
PM->>C: cache hit, skip preload
GB-->>G: isLoaded true
G->>SR: registerBigRoadElement
G->>AH: page_view + function_event JoinGame Show
D->>UI: render user info + listeners
UI-->>D: balance update setBalanceByPlaceBet=true
```

---

### Detailed Flow

-   **URLContext**

    -   **parseContextFromURL** sees `token`, `appType=1` and returns `{ token, gameId: 148, language: null }`.
    -   Subsequent loads often prefer `contextFromLocalStorage` when no query params are present.

-   **SplashScreen**

    -   **getSession** with token → `true`.
    -   **loadLanguage** selects `vi`.
    -   **authorize session** and **loadLobbyConfigs** complete successfully.
    -   Game validation resolves `toLoadGameId=148`, `isGameAvailable=true`.

-   **PreloadResources (App-level)**

    -   Calls `/api/preload-images` and receives 126 paths in ~78ms.
    -   Progressive load runs in 26 batches, all critical, no failures.
    -   Progress reaches 100%; cache marked warm for `gameId=148`.

-   **Dashboard**

    -   Renders with `openGameId` unset initially; then calls `openGame(148)`.
    -   Updates URL context with `gameId=148`.
    -   Bypasses offer check because query game is SeDie.

-   **Games → GameBase (SeDieMultiplayer)**

    -   Resolves component via `getGameComponentById(148)`.
    -   In-game `PreloadResources` detects cache hit and skips loading.
    -   Scoreboard and UI listeners initialize; user info reflects lobby vs in-game cursor class changes.

-   **Analytics**
    -   `login(urlContext)`, `setUser(playerId)`, `sso_event` for SSO_To_Game.
    -   `page_view` for SeDieMultiplayer and `function_event` JoinGame:Show.

---

### Timings and Counts (from logs)

-   **Preload API**: 78ms (126 image paths)
-   **Progressive load**: 26 batches (critical=126) → 100%
-   **Reported total preload time**: ~576ms
-   **Offer games count**: 124

---

### Notable Side Effects

-   **URL**: `updateURLContext({ gameId: 148 })` on openGame
-   **Cache**: App-level warmup ensures in-game preload is a cache hit
-   **UI**: UserInfo registers listeners; cursor class toggles for lobby vs in-game

---

### Recommendations

-   **Reduce duplicate URLContext parsing** within a single render cycle; memoize where feasible.
-   **Throttle or gate verbose per-image logs** behind a debug flag to minimize console noise.
-   **Review Games re-renders**; apply memoization and stable props to avoid unnecessary rerenders.
-   **Add error metrics for critical asset failures** even if rare (0 failures in observed run).

---

### Related Docs

-   `docs/URL_Context_and_SplashScreen_Flow.md`
-   `docs/PRELOAD_PERFORMANCE_IMPROVEMENTS.md`
-   `docs/round-state-handler-and-timeline.md`
