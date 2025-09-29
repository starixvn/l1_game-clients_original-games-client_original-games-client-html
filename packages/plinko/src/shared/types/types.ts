// Component prop interfaces following Interface Segregation Principle

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GameBackgroundProps {
    // No props needed for now - purely presentational
}

export interface MultiplierDisplayProps {
    multipliers: string[];
}

export interface BallLayoutProps {
    rows: number;
    ballsPerRow?: number[];
    multipliers?: number[];
    probabilities?: number[];
    betAmount?: number;
    onBallHit?: (multiplier: number, betValue: number) => void;
}

export interface ValueDisplayProps {
    values: string[];
}

export interface WinMessageProps {
    winAmount?: number; // Legacy support
    isVisible?: boolean;
    message?: string; // New detailed message format
    multiplier?: number; // Multiplier value
    betAmount?: number; // Bet amount
    onAnimationEnd?: () => void; // Callback when animation completes
}

export interface BetControlsProps {
    betAmount: number;
    gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
    rows: number;
    numberOfBets: number;
    onWinAction: 'Reset' | 'Increase';
    onWinPercentage: number;
    onLossAction: 'Reset' | 'Increase';
    onLossPercentage: number;
    stopOnWin: number;
    stopOnLoss: number;
    activeTab: 'Manual' | 'Auto';
    onBetAmountChange: (amount: number) => void;
    onGameModeChange: (mode: BetControlsProps['gameMode']) => void;
    onRowsChange: (rows: number) => void;
    onNumberOfBetsChange: (bets: number) => void;
    onWinActionChange: (action: BetControlsProps['onWinAction']) => void;
    onWinPercentageChange: (percentage: number) => void;
    onLossActionChange: (action: BetControlsProps['onLossAction']) => void;
    onLossPercentageChange: (percentage: number) => void;
    onStopOnWinChange: (amount: number) => void;
    onStopOnLossChange: (amount: number) => void;
}

export interface GameTabsProps {
    activeTab: 'Manual' | 'Auto';
    onTabChange: (tab: 'Manual' | 'Auto') => void;
    soundEnabled: boolean;
    onSoundToggle: () => void;
}

export interface GameInfoProps {
    gameName: string;
    rtp: string;
}

export interface BetRecord {
    player: string;
    betAmount: number;
    payout: number;
}

export interface BetsTableProps {
    bets: BetRecord[];
    activeTab: 'All' | 'My' | 'HighRoller';
    onTabChange: (tab: BetsTableProps['activeTab']) => void;
}

export interface PayoutsRowProps {
    gameMode: BetControlsProps['gameMode'];
    rows: number;
    betAmount: number;
}

// Sub-component interfaces for BetControls
export interface BetAmountControlsProps {
    betAmount: number;
    onBetAmountChange: (amount: number) => void;
}

export interface BetAmountInputProps {
    betAmount: number;
    onBetAmountChange: (amount: number) => void;
    showError?: boolean;
    errorMessage?: string;
}

export interface GameModeSelectorProps {
    gameMode: BetControlsProps['gameMode'];
    onGameModeChange: (mode: BetControlsProps['gameMode']) => void;
}

export interface RowsSelectorProps {
    rows: number;
    onRowsChange: (rows: number) => void;
    disabled?: boolean;
}

export interface NumberOfBetsSelectorProps {
    numberOfBets: number;
    onNumberOfBetsChange: (bets: number) => void;
}

export interface OnWinControlsProps {
    onWinAction: BetControlsProps['onWinAction'];
    onWinPercentage: number;
    onWinActionChange: (action: BetControlsProps['onWinAction']) => void;
    onWinPercentageChange: (percentage: number) => void;
}

export interface OnLossControlsProps {
    onLossAction: BetControlsProps['onLossAction'];
    onLossPercentage: number;
    onLossActionChange: (action: BetControlsProps['onLossAction']) => void;
    onLossPercentageChange: (percentage: number) => void;
}

export interface StopOnWinControlsProps {
    stopOnWin: number;
    onStopOnWinChange: (amount: number) => void;
}

export interface StopOnLossControlsProps {
    stopOnLoss: number;
    onStopOnLossChange: (amount: number) => void;
}

// Sub-component interfaces for BallLayout
export interface BallProps {
    sizeClass: string;
    typeClass: string;
    multiplier?: number;
    payoutClass?: string;
}

export interface BallRowProps {
    balls: BallProps[];
    rowClass: string;
}

// Sub-component interfaces for BetsTable
export interface BetsTableHeaderProps {
    activeTab: BetsTableProps['activeTab'];
    onTabChange: (tab: BetsTableProps['activeTab']) => void;
}

export interface BetsTableRowProps {
    bet: BetRecord;
    rowClass: string;
}

// Sub-component interfaces for GameTabs
export interface TabNavigationProps {
    activeTab: GameTabsProps['activeTab'];
    onTabChange: (tab: GameTabsProps['activeTab']) => void;
}

export interface IconControlsProps {
    soundEnabled: boolean;
    onSoundToggle: () => void;
}

// Main game state interface
export interface GameState {
    currentWin: number;
    betAmount: number;
    gameMode: BetControlsProps['gameMode'];
    rows: number;
    numberOfBets: number;
    onWinAction: BetControlsProps['onWinAction'];
    onWinPercentage: number;
    onLossAction: BetControlsProps['onLossAction'];
    onLossPercentage: number;
    stopOnWin: number;
    stopOnLoss: number;
    activeTab: GameTabsProps['activeTab'];
    soundEnabled: boolean;
    balance: number;
    bets: BetRecord[];
    betsTab: BetsTableProps['activeTab'];
}
