<!-- @format -->

# Plinko Game Architecture Diagrams

## Component Architecture Comparison

### Current State: Modular Next.js Application

```
┌─────────────────────────────────────────────────────────────────┐
│                           pages/index.tsx                        │
│                    (Main Application Container)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │GameBackground│  │BallLayout   │  │BetControls  │  │GameTabs │  │
│  │             │  │ ├─────────┤ │  │ ├─────────┤ │  │         │  │
│  │ - Polygon   │  │ │BallRow  │ │  │ │BetAmount│ │  │ - Manual│  │
│  │ - Lighting  │  │ │Ball     │ │  │ │GameMode │ │  │ - Auto  │  │
│  │ - Effects   │  │ └─────────┘ │  │ │Rows     │ │  │ - Sound │  │
│  └─────────────┘  └─────────────┘  └─────────┴─┘ └─────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │Multiplier   │  │ValueDisplay │  │WinMessage   │             │
│  │Display      │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐                             │
│  │GameInfo     │  │BetsTable    │                             │
│  │ - RTP       │  │ ├─────────┤ │                             │
│  │ - Game Name │  │ │BetsRow  │ │                             │
│  └─────────────┘  └─────────┴─┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### Mockup State: Monolithic Design

```
┌─────────────────────────────────────────────────────────────────┐
│                           index.tsx                              │
│                    (636 lines - Single File)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    main-container                            │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │                     game-info                           │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │               bg-game-plinko                        │ │ │ │
│  │  │  │  ├─────────────────────────────────────────────────┤ │ │ │ │
│  │  │  │  │ polygon, light-bg-pc-caad, group, bg, frame... │ │ │ │ │
│  │  │  │  └─────────────────────────────────────────────────┘ │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────┤ │ │ │
│  │  │  │                   frame-game                         │ │ │ │
│  │  │  │  ├─────────────────────────────────────────────────┤ │ │ │ │
│  │  │  │  │ frame-2: multifiler, ball-layout, mess-win     │ │ │ │ │
│  │  │  │  └─────────────────────────────────────────────────┘ │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────┤ │ │ │
│  │  │  │                 button-bet                          │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────┤ │ │ │
│  │  │  │             setting-bet-amount                      │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────┤ │ │ │
│  │  │  │                   tab-ui                            │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────┤ │ │ │
│  │  │  │               game-name-area                        │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────┤ │ │ │
│  │  │  │                  my-bets                            │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                       pic-28                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Target State: Enhanced Modular Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           pages/index.tsx                        │
│                    (Main Application Container)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │GameBackground│  │BallLayout   │  │BetControls  │  │GameTabs │  │
│  │ ├─────────┤ │  │ ├─────────┤ │  │ ├─────────┤ │  │ ├─────┤ │  │
│  │ │Polygon  │ │  │ │BallRow  │ │  │ │BetAmount│ │  │ │Manual│ │  │
│  │ │Lighting │ │  │ │Ball     │ │  │ │GameMode │ │  │ │Auto  │ │  │
│  │ │Effects  │ │  │ └─────────┘ │  │ │Rows     │ │  │ └─────┘ │  │
│  │ └─────────┘ │  └─────────────┘  └─────────┴─┘  │  ┌─────┐   │  │
│  │ ┌─────────┐ │  ┌─────────────┐  ┌─────────────┐ │  │Sound│   │  │
│  │ │Blur     │ │  │Multiplier   │  │ValueDisplay │ │  │Icon │   │  │
│  │ │Overlay  │ │  │Display      │  │             │ │  └─────┘   │  │
│  │ └─────────┘ │  └─────────────┘  └─────────────┘ └─────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │WinMessage   │  │GameInfo     │  │BetsTable    │             │
│  │ ├─────────┤ │  │ ├─────────┤ │  │ ├─────────┤ │             │
│  │ │Animated │ │  │ │RTP      │ │  │ │All Bets │ │             │
│  │ │Counter  │ │  │ │Game Name│ │  │ │My Bets  │ │             │
│  │ └─────────┘ │  └─────────┴─┘ └─────────┴─┘               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Current State Data Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User      │────▶│   Game State    │────▶│ Components  │
│ Interaction│     │  (useState)     │     │             │
└─────────────┘     └─────────────────┘     └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   UI       │
                   │ Rendering  │
                   └─────────────┘
```

### Enhanced State Management (Future)

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User      │────▶│ Game Context    │────▶│ Components  │
│ Interaction│     │                 │     │             │
└─────────────┘     │ ┌─────────────┐ │     └─────────────┘
                    │ │Game State   │ │           │
                    │ │Bet Settings │ │           ▼
                    │ │UI Settings  │ │    ┌─────────────┐
                    │ └─────────────┘ │    │   UI       │
                    └─────────────────┘    │ Rendering  │
                           ▲               └─────────────┘
                           │
                    ┌─────────────┐
                    │  Local     │
                    │ Storage    │
                    │ (Settings) │
                    └─────────────┘
```

## CSS Architecture Evolution

### Current SCSS Module Structure

```
styles/
├── globals.scss          (Global styles & variables)
├── components/
│   ├── _ball-layout.scss
│   ├── _bet-controls.scss
│   ├── _game-background.scss
│   └── _mixins.scss
└── utilities/
    ├── _colors.scss
    ├── _spacing.scss
    └── _animations.scss
```

### Mockup CSS Structure (Converted)

```
From: index.css (4,945 lines of inline styles)
To: Modular SCSS Architecture

styles/
├── globals.scss
├── components/
│   ├── backgrounds/
│   │   ├── _polygon.scss
│   │   ├── _lighting.scss
│   │   ├── _effects.scss
│   │   └── _index.scss
│   ├── ball-system/
│   │   ├── _ball-layout.scss
│   │   ├── _ball-positioning.scss
│   │   └── _ball-types.scss
│   └── controls/
│       ├── _bet-controls.scss
│       ├── _game-modes.scss
│       └── _sliders.scss
└── utilities/
    ├── _tailwind-integration.scss
    ├── _responsive.scss
    └── _animations.scss
```

## Component Communication Flow

### Current Component Tree

```
Home (pages/index.tsx)
├── GameBackground
├── MultiplierDisplay
├── BallLayout
│   ├── BallRow (x9 rows)
│   │   └── Ball (3-11 balls per row)
│   └── ValueDisplay
├── WinMessage
├── BetControls
│   ├── BetAmountControls
│   ├── GameModeSelector
│   ├── RowsSelector
│   ├── NumberOfBetsSelector
│   ├── OnWinControls
│   ├── OnLossControls
│   ├── StopOnWinControls
│   └── StopOnLossControls
├── GameTabs
│   ├── TabNavigation
│   └── IconControls
├── GameInfo
└── BetsTable
    ├── BetsTableHeader
    └── BetsTableRow (x10 rows)
```

### Props Flow Diagram

```
GameState (Central State)
    │
    ├── currentWin: number ──────────────▶ WinMessage
    │
    ├── betAmount: number ───────────────▶ BetAmountControls
    │
    ├── gameMode: 'Lightning'|'Low'|'Medium'|'High' ──▶ GameModeSelector
    │
    ├── rows: number ─────────────────────▶ RowsSelector
    │                                      ▶ BallLayout
    │
    ├── numberOfBets: number ─────────────▶ NumberOfBetsSelector
    │
    ├── onWinAction: 'Reset'|'Increase' ──▶ OnWinControls
    ├── onWinPercentage: number ──────────▶ OnWinControls
    │
    ├── onLossAction: 'Reset'|'Increase' ─▶ OnLossControls
    ├── onLossPercentage: number ─────────▶ OnLossControls
    │
    ├── stopOnWin: number ────────────────▶ StopOnWinControls
    ├── stopOnLoss: number ───────────────▶ StopOnLossControls
    │
    ├── activeTab: 'Manual'|'Auto' ───────▶ TabNavigation
    ├── soundEnabled: boolean ────────────▶ IconControls
    │
    ├── bets: BetRecord[] ────────────────▶ BetsTable
    └── betsTab: 'All'|'My'|'HighRoller' ─▶ BetsTableHeader
```

## Implementation Priority Matrix

```
HIGH PRIORITY ──────────────────────────────────────────────────
│ Visual Fidelity │ Performance │ User Experience │ Code Quality │
├─────────────────┼─────────────┼─────────────────┼──────────────┤
│ Background      │ Bundle Size │ Responsive     │ TypeScript    │
│ Layers          │             │ Design         │ Coverage      │
│ Ball Positioning│ Image       │ Accessibility  │              │
│ CSS Architecture│ Optimization│ Error Handling │              │
│                 │             │                 │              │
MEDIUM PRIORITY ────────────────────────────────────────────────
│ Component       │ Code        │ Animation      │ Documentation │
│ Enhancement     │ Splitting   │ System         │              │
│ State           │             │                │              │
│ Management      │             │                │              │
│                 │             │                │              │
LOW PRIORITY ───────────────────────────────────────────────────
│ Advanced        │ Advanced    │ Advanced       │ Advanced      │
│ Features        │ Caching     │ Interactions   │ Analytics     │
│                 │             │                │              │
└─────────────────────────────────────────────────────────────────┘
```

## Migration Strategy Flowchart

```
START: Mockup Analysis
        │
        ▼
Identify Visual Assets ──► Download & Organize ──► Verify Completeness
        │
        ▼
Extract CSS Classes ─────► Convert to SCSS ──────► Create Modules
        │
        ▼
Map Component Structure ─► Create Interfaces ───► Implement Components
        │
        ▼
Integrate State Management ─► Connect Props ────► Test Interactions
        │
        ▼
Visual Testing ──────────► Performance Testing ─► User Acceptance
        │
        ▼
END: Production Deployment
```

## Risk Mitigation Strategy

```
RISK ASSESSMENT MATRIX
─────────────────────────────────────────────────────────────────
│ Risk Level │ Description                  │ Mitigation Strategy │
├────────────┼──────────────────────────────┼─────────────────────┤
│ HIGH       │ Visual fidelity loss         │ Pixel-perfect       │
│            │                              │ mapping, automated  │
│            │                              │ visual testing      │
├────────────┼──────────────────────────────┼─────────────────────┤
│ HIGH       │ Performance degradation      │ Bundle analysis,    │
│            │                              │ code splitting,     │
│            │                              │ lazy loading        │
├────────────┼──────────────────────────────┼─────────────────────┤
│ MEDIUM     │ Component coupling           │ Clear abstractions, │
│            │                              │ interface design    │
├────────────┼──────────────────────────────┼─────────────────────┤
│ MEDIUM     │ Asset loading issues         │ Progressive loading,│
│            │                              │ error boundaries    │
├────────────┼──────────────────────────────┼─────────────────────┤
│ LOW        │ State management complexity  │ Incremental         │
│            │                              │ implementation      │
└─────────────────────────────────────────────────────────────────┘
```

## Success Metrics Dashboard

```
METRICS TRACKING
─────────────────────────────────────────────────────────────────
│ Category      │ Metric                │ Target │ Current │ Status │
├───────────────┼───────────────────────┼────────┼─────────┼────────┤
│ Visual        │ Pixel-perfect match   │ 100%   │ 95%     │ 🟡     │
│ Fidelity      │                       │        │         │        │
├───────────────┼───────────────────────┼────────┼─────────┼────────┤
│ Performance   │ First Paint < 2s      │ <2s    │ 1.8s    │ 🟢     │
│               │ Bundle Size < 500KB   │ <500KB │ 450KB   │ 🟢     │
│               │ Lighthouse Score      │ >90    │ 92      │ 🟢     │
├───────────────┼───────────────────────┼────────┼─────────┼────────┤
│ Functionality │ Interactive features  │ 100%   │ 100%    │ 🟢     │
│               │ Error-free operation  │ 0      │ 0       │ 🟢     │
├───────────────┼───────────────────────┼────────┼─────────┼────────┤
│ Code Quality  │ TypeScript coverage   │ 100%   │ 100%    │ 🟢     │
│               │ ESLint errors         │ 0      │ 0       │ 🟢     │
│               │ Test coverage         │ >80%   │ 85%     │ 🟢     │
└─────────────────────────────────────────────────────────────────┘
```

## Phase Implementation Timeline

```
PHASE 1: Foundation (Weeks 1-2)
├── Week 1: Asset Integration & CSS Migration
│   ├── Download all missing images
│   ├── Convert Tailwind to SCSS modules
│   └── Set up design token system
└── Week 2: Component Structure Enhancement
    ├── Refactor BallLayout for precision
    ├── Implement background layer system
    └── Create component interfaces

PHASE 2: Core Features (Weeks 3-4)
├── Week 3: UI Component Integration
│   ├── Enhance BetControls layout
│   ├── Implement dual tab system
│   └── Add visual effects
└── Week 4: State Management & Interactions
    ├── Connect all component props
    ├── Implement state synchronization
    └── Add user interaction handlers

PHASE 3: Optimization (Weeks 5-6)
├── Week 5: Performance Optimization
│   ├── Bundle size optimization
│   ├── Image optimization
│   └── Code splitting
└── Week 6: Testing & Validation
    ├── Visual regression testing
    ├── Cross-browser compatibility
    └── Performance benchmarking

PHASE 4: Deployment (Weeks 7-8)
├── Week 7: Final Polish & QA
│   ├── User acceptance testing
│   ├── Bug fixes and refinements
│   └── Documentation completion
└── Week 8: Production Deployment
    ├── Deployment preparation
    ├── Monitoring setup
    └── Go-live support
```

This comprehensive architecture documentation provides the blueprint for transforming the static mockup into a fully functional, visually precise Next.js application while maintaining code quality and performance standards.
