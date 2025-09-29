# Architecture Documentation

## 🏗️ System Architecture

This document provides a comprehensive overview of the Plinko game's architecture, design decisions, and implementation details.

### Core Principles

1. **Domain-Driven Design (DDD)**: Code organized around business domains
2. **Feature-Based Structure**: Related functionality grouped together
3. **UI Layout Organization**: Components grouped by their layout purpose
4. **Separation of Concerns**: Business logic separated from presentation
5. **Type Safety**: Comprehensive TypeScript usage throughout

## 📁 Directory Structure

### Feature Organization

```
src/features/
├── game/             # Game domain - ball physics, multipliers, displays
├── betting/          # Betting domain - controls, strategies, history
└── ui/               # UI domain - shared components, navigation, info
```

### UI Layout Groups

Each feature organizes components by their UI layout purpose:

#### Game Feature
```
game/components/
├── ball/      # Ball physics & rendering (Ball, BallRow, CanvasBallLayout)
├── display/   # Information display (MultiplierDisplay, PayoutsDisplay)
└── layout/    # Containers & backgrounds (GameBackground, WinMessage)
```

#### Betting Feature
```
betting/components/
├── controls/  # Input elements (BetAmountControls, PercentageControl)
├── panels/    # Main interfaces (AutoBetPanel, BetControls)
└── tables/    # Data display (BetsTable, BetsTableHeader)
```

#### UI Feature
```
ui/components/
├── navigation/ # Navigation elements (GameTabs, TabNavigation)
├── controls/   # Interactive controls (LoggerControls, IconControls)
└── info/       # Information displays (GameInfo)
```

### Business Logic Separation

```
src/lib/
├── physics/   # Physics calculations, Matter.js integration
├── betting/   # Betting algorithms, auto-bet strategies
└── utils/     # Shared utilities, formatting functions
```

### Shared Resources

```
src/shared/
├── types/     # Global TypeScript definitions
├── hooks/     # Cross-feature custom hooks
└── components/ # Reusable components
```

## 🔄 Data Flow

### Game State Management

1. **Local State**: Component-specific state using `useState`
2. **Feature State**: Context-based state management within features
3. **Global State**: Minimal global state, prefer prop drilling

### Service Layer

```
services/
├── gameService.ts      # Game state & API communication
├── autoBetHandler.ts   # Auto-betting logic
├── logger.ts          # Logging utilities
└── useGameService.tsx # React hook for game service
```

## 🎯 Component Design Patterns

### 1. Barrel Exports

Each directory uses index files for clean imports:

```typescript
// src/features/game/components/index.ts
export { default as BallLayout } from './ball/CanvasBallLayout';
export { default as Ball } from './ball/Ball';
export { default as MultiplierDisplay } from './display/MultiplierDisplay';
```

### 2. Props Interface Pattern

All components define clear TypeScript interfaces:

```typescript
interface PercentageControlProps {
  title: string;
  action: 'Reset' | 'Increase';
  percentage: number;
  onActionChange: (action: string) => void;
  onPercentageChange: (percentage: number) => void;
}
```

### 3. Custom Hooks Pattern

Business logic extracted into reusable hooks:

```typescript
// useBetLogic.ts - Handles bet placement and status tracking
// useGameSettings.ts - Manages game configuration persistence
```

### 4. Utility Functions

Shared utilities in `lib/utils/`:

```typescript
// numberFormatting.ts - Currency and percentage formatting
export const formatNumberWithCommas = (value: number): string => { ... }
```

## 🔧 Development Workflow

### Adding New Components

1. **Identify Feature**: Which domain does it belong to?
2. **Choose Layout Group**: What UI layout purpose does it serve?
3. **Create Component**: Follow established patterns
4. **Update Exports**: Add to appropriate index files
5. **Add Tests**: Ensure component is properly tested

### Code Organization Rules

1. **One Component Per File**: Each component in its own file
2. **Colocated Styles**: CSS modules alongside components
3. **Type Definitions**: Interfaces defined in same file or types directory
4. **Barrel Exports**: Clean import paths via index files

## 🎨 Styling Architecture

### CSS Modules Strategy

- **Component-scoped**: Each component has its own `.module.scss`
- **BEM Methodology**: Block-Element-Modifier naming
- **Responsive Design**: Mobile-first with breakpoints
- **Theme Variables**: Consistent colors and spacing

### Example Structure

```scss
// PercentageControl.module.scss
.container {
  // Component styles
}

.reset-button,
.increase-button {
  // Button variants
}

.selected {
  // Modifier styles
}
```

## 🔄 State Management Strategy

### Component State (useState)
- Form inputs, UI state, loading states
- Component-specific interactions

### Context State (useContext)
- Feature-level state sharing
- User preferences, theme settings

### Server State (Custom Hooks)
- API data, real-time updates
- Game state synchronization

## 🧪 Testing Strategy

### Unit Tests
- Component rendering and interactions
- Utility function correctness
- Hook behavior validation

### Integration Tests
- Component combinations
- Feature workflows
- API integrations

### E2E Tests
- Critical user journeys
- Cross-browser compatibility
- Performance validation

## 🚀 Performance Optimizations

### React Optimizations
- `React.memo` for expensive components
- `useMemo` for expensive calculations
- `useCallback` for event handlers

### Bundle Optimization
- Code splitting by feature
- Lazy loading of heavy components
- Tree shaking for unused code

### Physics Performance
- Efficient collision detection
- Object pooling for balls
- Frame rate optimization

## 🔒 Security Considerations

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- Sanitization of all user inputs

### API Security
- Authentication for sensitive operations
- Rate limiting on betting endpoints
- CSRF protection on state-changing requests

## 📊 Monitoring & Analytics

### Logging Strategy
- Structured logging with context
- Error tracking and alerting
- Performance metrics collection

### User Analytics
- Betting pattern analysis
- Feature usage tracking
- Conversion funnel monitoring

## 🔄 Deployment Strategy

### Build Process
```bash
yarn build    # Production build
yarn start    # Production server
```

### Environment Configuration
- Environment-specific settings
- Feature flags for gradual rollouts
- CDN configuration for assets

## 📚 Documentation Standards

### Code Documentation
- JSDoc comments for public APIs
- Inline comments for complex logic
- README files for major features

### API Documentation
- TypeScript interfaces as API contracts
- Example usage in comments
- Migration guides for breaking changes

---

This architecture provides a solid foundation for scalable, maintainable, and feature-rich web applications. The separation of concerns, clear organization, and comprehensive testing strategy ensure long-term code health and developer productivity.
