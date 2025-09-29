# Component Library

This document provides a comprehensive catalog of all components in the Plinko game, organized by feature and UI layout purpose.

## 🎮 Game Components

### Ball Components (`src/features/game/components/ball/`)

#### `BallLayout`
**Purpose**: Main ball physics container and layout manager
**Location**: `src/features/game/components/ball/BallLayout.tsx`
**Props**:
```typescript
interface BallLayoutProps {
  rows: number;
  ballsPerRow?: number[];
  multipliers?: number[];
  probabilities?: number[];
  betAmount?: number;
  onBallHit?: (multiplier: number, betValue: number) => void;
}
```
**Usage**:
```tsx
<BallLayout
  rows={9}
  multipliers={[0.5, 1.4, 190]}
  betAmount={100}
  onBallHit={(multiplier, betValue) => console.log('Hit!', multiplier)}
/>
```

#### `CanvasBallLayout`
**Purpose**: Canvas-based physics renderer for ball animations
**Location**: `src/features/game/components/ball/CanvasBallLayout.tsx`
**Props**: Extends `BallLayoutProps` with canvas-specific properties

#### `Ball`
**Purpose**: Individual ball component with physics properties
**Location**: `src/features/game/components/ball/Ball.tsx`
**Props**:
```typescript
interface BallProps {
  sizeClass: string;
  typeClass: string;
  multiplier?: number;
  payoutClass?: string;
}
```

#### `BallRow`
**Purpose**: Horizontal row of balls for layout structure
**Location**: `src/features/game/components/ball/BallRow.tsx`
**Props**:
```typescript
interface BallRowProps {
  balls: BallProps[];
  rowClass: string;
}
```

#### `HybridBallLayoutTest`
**Purpose**: Test component for hybrid ball layout implementations
**Location**: `src/features/game/components/ball/HybridBallLayoutTest.tsx`

### Display Components (`src/features/game/components/display/`)

#### `MultiplierDisplay`
**Purpose**: Displays available multipliers for each row
**Location**: `src/features/game/components/display/MultiplierDisplay.tsx`
**Props**:
```typescript
interface MultiplierDisplayProps {
  multipliers: string[];
}
```
**Usage**:
```tsx
<MultiplierDisplay multipliers={['0.5x', '1.4x', '190x']} />
```

#### `PayoutsDisplay`
**Purpose**: Shows payout information with probabilities
**Location**: `src/features/game/components/display/PayoutsDisplay.tsx`
**Props**:
```typescript
interface PayoutsDisplayProps {
  multipliers: number[];
  probabilities: number[];
  betAmount: number;
  rows: number;
  className?: string;
}
```

#### `PayoutsRow`
**Purpose**: Individual payout row with game mode context
**Location**: `src/features/game/components/display/PayoutsRow.tsx`
**Props**:
```typescript
interface PayoutsRowProps {
  gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
  rows: number;
  betAmount: number;
}
```

#### `ValueDisplay`
**Purpose**: Generic value display component
**Location**: `src/features/game/components/display/ValueDisplay.tsx`
**Props**:
```typescript
interface ValueDisplayProps {
  values: string[];
}
```

### Layout Components (`src/features/game/components/layout/`)

#### `GameBackground`
**Purpose**: Game area background and visual container
**Location**: `src/features/game/components/layout/GameBackground.tsx`
**Props**:
```typescript
interface GameBackgroundProps {
  // No props - purely presentational
}
```

#### `WinMessage`
**Purpose**: Animated win message display
**Location**: `src/features/game/components/layout/WinMessage.tsx`
**Props**:
```typescript
interface WinMessageProps {
  winAmount?: number;
  isVisible?: boolean;
  message?: string;
  multiplier?: number;
  betAmount?: number;
  onAnimationEnd?: () => void;
}
```

## 💰 Betting Components

### Control Components (`src/features/betting/components/controls/`)

#### `BetAmountControls`
**Purpose**: Bet amount input with validation
**Location**: `src/features/betting/components/controls/BetAmountControls.tsx`
**Props**:
```typescript
interface BetAmountControlsProps {
  betAmount: number;
  onBetAmountChange: (amount: number) => void;
}
```

#### `BetAmountInput`
**Purpose**: Enhanced bet amount input with formatting
**Location**: `src/features/betting/components/controls/BetAmountInput.tsx`
**Props**: Extends `BetAmountControlsProps` with error handling

#### `GameModeSelector`
**Purpose**: Game mode selection (Lightning/Low/Medium/High)
**Location**: `src/features/betting/components/controls/GameModeSelector.tsx`
**Props**:
```typescript
interface GameModeSelectorProps {
  gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
  onGameModeChange: (mode: GameModeSelectorProps['gameMode']) => void;
}
```

#### `RowsSelector`
**Purpose**: Number of rows selection (8-16 rows)
**Location**: `src/features/betting/components/controls/RowsSelector.tsx`
**Props**:
```typescript
interface RowsSelectorProps {
  rows: number;
  onRowsChange: (rows: number) => void;
  disabled?: boolean;
}
```

#### `NumberOfBetsSelector`
**Purpose**: Auto-bet count selection with preset buttons
**Location**: `src/features/betting/components/controls/NumberOfBetsSelector.tsx`
**Props**:
```typescript
interface NumberOfBetsSelectorProps {
  numberOfBets: number;
  onNumberOfBetsChange: (bets: number) => void;
}
```

#### Percentage Controls
**Purpose**: Win/loss percentage adjustments for auto-betting

##### `OnWinControls`
**Location**: `src/features/betting/components/controls/OnWinControls.tsx`
**Props**:
```typescript
interface OnWinControlsProps {
  onWinAction: 'Reset' | 'Increase';
  onWinPercentage: number;
  onWinActionChange: (action: OnWinControlsProps['onWinAction']) => void;
  onWinPercentageChange: (percentage: number) => void;
}
```

##### `OnLossControls`
**Location**: `src/features/betting/components/controls/OnLossControls.tsx`
**Props**:
```typescript
interface OnLossControlsProps {
  onLossAction: 'Reset' | 'Increase';
  onLossPercentage: number;
  onLossActionChange: (action: OnLossControlsProps['onLossAction']) => void;
  onLossPercentageChange: (percentage: number) => void;
}
```

##### `PercentageControl`
**Purpose**: Reusable percentage control component
**Location**: `src/features/betting/components/controls/PercentageControl.tsx`
**Props**:
```typescript
interface PercentageControlProps {
  title: string;
  action: 'Reset' | 'Increase';
  percentage: number;
  onActionChange: (action: 'Reset' | 'Increase') => void;
  onPercentageChange: (percentage: number) => void;
  containerClassName?: string;
  titleClassName?: string;
}
```

#### Stop Controls
**Purpose**: Stop conditions for auto-betting

##### `StopOnWinControls`
**Location**: `src/features/betting/components/controls/StopOnWinControls.tsx`
**Props**:
```typescript
interface StopOnWinControlsProps {
  stopOnWin: number;
  onStopOnWinChange: (amount: number) => void;
}
```

##### `StopOnLossControls`
**Location**: `src/features/betting/components/controls/StopOnLossControls.tsx`
**Props**:
```typescript
interface StopOnLossControlsProps {
  stopOnLoss: number;
  onStopOnLossChange: (amount: number) => void;
}
```

#### `BetConfig`
**Purpose**: Shared bet configuration utilities
**Location**: `src/features/betting/components/controls/bet-config.ts`
**Exports**: `BET_CONFIG`, `formatBetAmount`, `validateBetAmount`, `parseBetAmount`

### Panel Components (`src/features/betting/components/panels/`)

#### `AutoBetPanel`
**Purpose**: Main auto-betting configuration panel
**Location**: `src/features/betting/components/panels/AutoBetPanel.tsx`
**Props**:
```typescript
interface AutoBetPanelProps {
  sharedConfig: {
    betAmount: number;
    gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
    rows: number;
  };
  autoConfig: {
    numberOfBets: number;
    onWinAction: 'Reset' | 'Increase';
    onWinPercentage: number;
    onLossAction: 'Reset' | 'Increase';
    onLossPercentage: number;
    stopOnWin: number;
    stopOnLoss: number;
  };
  activeTab: 'Manual' | 'Auto';
  onSharedConfigChange: (config: Partial<SharedConfig>) => void;
  onAutoConfigChange: (config: Partial<AutoConfig>) => void;
  onTabChange?: (tab: 'Manual' | 'Auto') => void;
  onBalanceUpdate?: (newBalance: number) => void;
  onBetResult?: (result: { win: boolean; payout: number; betAmount: number }) => void;
}
```

#### `BetControls`
**Purpose**: Manual betting controls panel
**Location**: `src/features/betting/components/panels/BetControls.tsx`
**Props**: Complex betting control props

#### `GameConfig`
**Purpose**: Game configuration and bet placement
**Location**: `src/features/betting/components/panels/GameConfig.tsx`
**Props**: Game configuration props with bet placement handlers

### Table Components (`src/features/betting/components/tables/`)

#### `BetsTable`
**Purpose**: Bet history and results display
**Location**: `src/features/betting/components/tables/BetsTable.tsx`
**Props**:
```typescript
interface BetsTableProps {
  bets: BetRecord[];
  activeTab: 'All' | 'My' | 'HighRoller';
  onTabChange: (tab: BetsTableProps['activeTab']) => void;
}
```

#### `BetsTableHeader`
**Purpose**: Table header with tab navigation
**Location**: `src/features/betting/components/tables/BetsTableHeader.tsx`
**Props**:
```typescript
interface BetsTableHeaderProps {
  activeTab: 'All' | 'My' | 'HighRoller';
  onTabChange: (tab: BetsTableProps['activeTab']) => void;
}
```

#### `BetsTableRow`
**Purpose**: Individual bet record display
**Location**: `src/features/betting/components/tables/BetsTableRow.tsx`
**Props**:
```typescript
interface BetsTableRowProps {
  bet: BetRecord;
  rowClass: string;
}
```

## 🎨 UI Components

### Navigation Components (`src/features/ui/components/navigation/`)

#### `GameTabs`
**Purpose**: Manual/Auto betting mode tabs
**Location**: `src/features/ui/components/navigation/GameTabs.tsx`
**Props**:
```typescript
interface GameTabsProps {
  activeTab: 'Manual' | 'Auto';
  onTabChange: (tab: 'Manual' | 'Auto') => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}
```

#### `TabNavigation`
**Purpose**: Tab navigation for bet tables
**Location**: `src/features/ui/components/navigation/TabNavigation.tsx`
**Props**:
```typescript
interface TabNavigationProps {
  activeTab: 'All' | 'My' | 'HighRoller';
  onTabChange: (tab: 'All' | 'My' | 'HighRoller') => void;
}
```

### Control Components (`src/features/ui/components/controls/`)

#### `LoggerControls`
**Purpose**: Development logging controls
**Location**: `src/features/ui/components/controls/LoggerControls.tsx`
**Props**:
```typescript
interface LoggerControlsProps {
  className?: string;
}
```

#### `IconControls`
**Purpose**: Sound and icon control buttons
**Location**: `src/features/ui/components/controls/IconControls.tsx`
**Props**:
```typescript
interface IconControlsProps {
  soundEnabled: boolean;
  onSoundToggle: () => void;
}
```

### Info Components (`src/features/ui/components/info/`)

#### `GameInfo`
**Purpose**: Game information display (RTP, game name)
**Location**: `src/features/ui/components/info/GameInfo.tsx`
**Props**:
```typescript
interface GameInfoProps {
  gameName: string;
  rtp: string;
}
```

## 🔧 Utility Components

### Shared Components (`src/shared/components/`)

*Currently empty - reserved for future cross-feature components*

## 📚 Type Definitions

### Core Types (`src/shared/types/types.ts`)

#### Game Types
```typescript
interface GameState {
  currentWin: number;
  betAmount: number;
  gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
  rows: number;
  // ... additional properties
}

interface BallLayoutProps {
  rows: number;
  ballsPerRow?: number[];
  multipliers?: number[];
  probabilities?: number[];
  betAmount?: number;
  onBallHit?: (multiplier: number, betValue: number) => void;
}
```

#### Betting Types
```typescript
interface BetRecord {
  player: string;
  betAmount: number;
  payout: number;
}

interface BetControlsProps {
  betAmount: number;
  gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
  rows: number;
  // ... additional properties
}
```

#### UI Types
```typescript
interface GameTabsProps {
  activeTab: 'Manual' | 'Auto';
  onTabChange: (tab: 'Manual' | 'Auto') => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

interface BetsTableProps {
  bets: BetRecord[];
  activeTab: 'All' | 'My' | 'HighRoller';
  onTabChange: (tab: BetsTableProps['activeTab']) => void;
}
```

## 🎯 Usage Examples

### Basic Game Setup
```tsx
import { BallLayout, MultiplierDisplay, WinMessage } from '@/features/game/components';
import { AutoBetPanel, BetsTable } from '@/features/betting/components';
import { GameTabs, GameInfo } from '@/features/ui/components';

function GamePage() {
  return (
    <div className="game-container">
      <GameInfo gameName="Plinko" rtp="97%" />

      <GameTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundEnabled={soundEnabled}
        onSoundToggle={toggleSound}
      />

      <BallLayout
        rows={gameState.rows}
        multipliers={multipliers}
        betAmount={gameState.betAmount}
        onBallHit={handleBallHit}
      />

      <MultiplierDisplay multipliers={multipliers} />

      <WinMessage
        isVisible={showWinMessage}
        message={winMessage}
        onAnimationEnd={() => setShowWinMessage(false)}
      />

      {activeTab === 'Auto' && (
        <AutoBetPanel
          sharedConfig={{
            betAmount: gameState.betAmount,
            gameMode: gameState.gameMode,
            rows: gameState.rows
          }}
          autoConfig={{
            numberOfBets: gameState.numberOfBets,
            onWinAction: gameState.onWinAction,
            onWinPercentage: gameState.onWinPercentage,
            onLossAction: gameState.onLossAction,
            onLossPercentage: gameState.onLossPercentage,
            stopOnWin: gameState.stopOnWin,
            stopOnLoss: gameState.stopOnLoss
          }}
          activeTab={activeTab}
          onSharedConfigChange={updateSharedConfig}
          onAutoConfigChange={updateAutoConfig}
          onTabChange={setActiveTab}
        />
      )}

      <BetsTable
        bets={betHistory}
        activeTab={tableTab}
        onTabChange={setTableTab}
      />
    </div>
  );
}
```

### Custom Hook Integration
```tsx
import { useBetLogic } from '@/shared/hooks';
import { useGameService, logger } from '@/services';

function useGameLogic() {
  const { betStatus, handlePlaceBet } = useBetLogic({
    gameMode: 'Lightning',
    rows: 9,
    betAmount: 100,
    balance: 1000,
    onBetPlaced: (bet) => logger.info('Bet placed', bet),
    onBalanceUpdate: (balance) => setBalance(balance)
  });

  const { placeBet, isBetting } = useGameService();

  return {
    betStatus,
    isBetting,
    handlePlaceBet
  };
}
```

## 🔍 Component Relationships

### Data Flow
```
User Input → UI Components → Feature Hooks → Shared Hooks → Services → API
                     ↓
              State Updates → Re-renders → Visual Feedback
```

### Dependency Graph
- **UI Components** depend on **Feature Components**
- **Feature Components** depend on **Shared Types** and **Shared Hooks**
- **Shared Hooks** depend on **Services** and **Business Logic**
- **Services** depend on **External APIs** and **Business Logic**
- **Business Logic** is self-contained in `lib/`

## 🚀 Performance Considerations

### Component Optimization
- All components use `React.memo` where appropriate
- Expensive calculations use `useMemo`
- Event handlers use `useCallback`
- Lazy loading for heavy components

### Bundle Splitting
- Feature-based code splitting
- Route-based lazy loading
- Shared chunk optimization

### Rendering Performance
- Efficient re-render prevention
- Minimal prop drilling
- Context optimization for feature state

---

This component library provides a complete, well-organized foundation for the Plinko game. Each component follows consistent patterns, clear interfaces, and optimal performance practices.
