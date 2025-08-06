# URL Context and SplashScreen Flow

This document details the flow of URL context parsing and the SplashScreen initialization in the client application, based on the provided debug logs. It includes a step-by-step breakdown and a flowchart diagram for clarity.

---

## Overview

When a user opens the application, the system determines the user's context (such as authentication token, language, and game selection) from the URL or local storage. This context is then used to initialize the SplashScreen, preload resources, and finally render the main dashboard and game components.

---

## Step-by-Step Flow

### 1. App Launch & URL Context Loading

-   **User opens the app** (possibly with query params in the URL).
-   `URLContext.loadURLContext` is called.
-   `parseContextFromURL` attempts to extract parameters like `token`, `lang`, `appType`, `op`, and `cg` from the URL.
-   If parameters are found, they are decoded and set as `contextFromURL`.
-   If not, the system checks localStorage for a previously saved context (`contextFromLocalStorage`).
-   If neither is available, a default context is used.

### 2. SplashScreen Initialization

-   The SplashScreen component receives the initial context (from URL, localStorage, or default).
-   It starts the initialization process:
    -   Calls `getSession` with the token to validate the session.
    -   Loads the selected language.
    -   Loads lobby/game configurations.
    -   Preloads resources (banners, game offer IDs, images, etc.).

### 3. Game Selection & Validation

-   If no `gameId` is provided, a default game is selected.
-   The selected or default game is validated against the enabled games list.
-   The final `gameId` to load is set.

### 4. Session Authorization & User Setup

-   The session is authorized.
-   User information is set up (analytics, player info, etc.).

### 5. Resource Preloading

-   The app preloads images and other resources required for the selected game.
-   A progress bar is updated as resources are loaded.
-   Once all resources are loaded, the dashboard is rendered.

### 6. Dashboard & Game Rendering

-   The dashboard displays user info, available games, and other UI components.
-   The selected game component is rendered and ready for user interaction.
-   User actions (such as switching games) update the URL context and user info as needed.

---

## Flowchart Diagram

```mermaid
flowchart TD
    A[Start: User opens app with URL] --> B[URLContext: loadURLContext called]
    B --> C[parseContextFromURL]
    C --> D{URL has params?}
    D -- Yes --> E[Extract token, lang, appType, op, cg]
    E --> F[Set contextFromURL]
    D -- No --> G[Check localStorage for context]
    G --> H{localStorage has context?}
    H -- Yes --> I[Set contextFromLocalStorage]
    H -- No --> J[Use default context]
    F & I & J --> K[SplashScreen: initial context setup]
    K --> L[handleInitialization]
    L --> M[getSession with token]
    M --> N{Session valid?}
    N -- Yes --> O[loadLanguage]
    O --> P[loadLobbyConfigs]
    P --> Q[PreloadResources: getAndHandleBannerOffer, getAndHandleGameOfferIds]
    Q --> R{gameId provided?}
    R -- No --> S[Use default gameId]
    R -- Yes --> T[Validate gameId]
    S & T --> U[Set final gameId to load]
    U --> V[Authorize session]
    V --> W[customStartup: set up user, analytics]
    W --> X[PreloadResources: preloadGameImages]
    X --> Y[Load images, update progress bar]
    Y --> Z{All images loaded?}
    Z -- Yes --> AA[Set isRenderDashboard true]
    AA --> AB[Dashboard: render games, user info, etc.]
    Z -- No --> Y
    AB --> AC[User interacts with games]
    AC --> AD[Update URLContext, user info, etc.]
    AD --> AB
    style A fill:#f9f,stroke:#333,stroke-width:2
    style AB fill:#bbf,stroke:#333,stroke-width:2
    style AA fill:#bfb,stroke:#333,stroke-width:2
    style K fill:#ff9,stroke:#333,stroke-width:2
    style B fill:#ff9,stroke:#333,stroke-width:2
    style Q fill:#ff9,stroke:#333,stroke-width:2
    style X fill:#ff9,stroke:#333,stroke-width:2
    style AC fill:#bbf,stroke:#333,stroke-width:2
    style AD fill:#bbf,stroke:#333,stroke-width:2
```

---

## Key Log Events (Reference)

-   `[URLContext] loadURLContext called` — Entry point for context loading.
-   `[URLContext] parseContextFromURL called` — Attempts to parse URL params.
-   `[SplashScreen] SplashScreen component rendering` — SplashScreen starts with initial context.
-   `[SplashScreen] handleInitialization started` — Initialization logic begins.
-   `[PreloadResources] ...` — Resource preloading and progress updates.
-   `[Dashboard] ...` — Dashboard and game rendering.

---

## Notes

-   The flow ensures that user context is always determined before rendering the main UI.
-   Resource preloading is optimized for user experience, showing a progress bar and only rendering the dashboard when ready.
-   The system gracefully falls back to localStorage or defaults if URL parameters are missing.

---

_Last updated: [auto-generated]_
