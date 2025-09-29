import React from 'react';
import { GameModeSelector, RowsSelector } from '../index';
import { useBetLogic } from '../../../../shared/hooks/useBetLogic';
import { useGameSettings } from '../../../../shared/hooks/useGameSettings';
import styles from './GameConfig.module.scss';

// Section 4.2: Game Mode and Rows Configuration
export interface GameConfigProps {
    gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
    rows: number;
    betAmount: number;
    balance: number;
    onGameModeChange: (mode: GameModeSelectorProps['gameMode']) => void;
    onRowsChange: (rows: number) => void;
    onBetPlaced: (betDetails: BetDetails) => void;
    onPayoutUpdate: (mode: string, rows: number) => void;
    onBalanceUpdate?: (newBalance: number) => void;
}

export interface BetDetails {
    gameMode: string;
    rows: number;
    betAmount: number;
    timestamp: number;
    status: 'pending' | 'accepted' | 'settled';
}

export interface GameModeSelectorProps {
    gameMode: 'Lightning' | 'Low' | 'Medium' | 'High';
    onGameModeChange: (mode: GameModeSelectorProps['gameMode']) => void;
}

export interface RowsSelectorProps {
    rows: number;
    onRowsChange: (rows: number) => void;
    disabled?: boolean;
}

const GameConfig: React.FC<GameConfigProps> = ({
    gameMode,
    rows,
    betAmount,
    balance,
    onGameModeChange,
    onRowsChange,
    onBetPlaced,
    onPayoutUpdate,
    onBalanceUpdate,
}) => {
    // Use custom hooks for bet logic and settings persistence
    const { betStatus, isPanelDisabled, isBetButtonDisabled, handlePlaceBet } = useBetLogic({
        gameMode,
        rows,
        betAmount,
        balance,
        onBetPlaced,
        onBalanceUpdate,
    });

    useGameSettings({
        gameMode,
        rows,
        onGameModeChange,
        onRowsChange,
    });

    // Handle mode change with payout update (Section 4.2)
    const handleModeChange = (mode: GameModeSelectorProps['gameMode']) => {
        onGameModeChange(mode);
        onPayoutUpdate(mode, rows);
    };

    // Handle rows change with payout update (Section 4.2)
    const handleRowsChange = (newRows: number) => {
        onRowsChange(newRows);
        onPayoutUpdate(gameMode, newRows);
    };

    return (
        <div className={styles.gameConfigPanel}>
            {/* Section 4.2: Game Mode and Rows Configuration */}
            <div className={`${styles.configSection} ${isPanelDisabled ? styles.disabled : ''}`}>
                <GameModeSelector
                    gameMode={gameMode}
                    onGameModeChange={handleModeChange}
                />

                <RowsSelector
                    rows={rows}
                    onRowsChange={handleRowsChange}
                    disabled={isPanelDisabled}
                />
            </div>

            {/* Section 4.4: Manual Bet Button */}
            <div className={styles.betSection}>
                <button
                    type="button"
                    className={`${styles.betButton} ${betStatus !== 'idle' ? styles.loading : ''} ${isBetButtonDisabled ? styles.disabled : ''}`}
                    onClick={handlePlaceBet}
                    disabled={isBetButtonDisabled}
                    aria-label="Place bet"
                >
                    {betStatus === 'placing' && 'Placing Bet...'}
                    {betStatus === 'accepted' && 'Bet Accepted'}
                    {betStatus === 'dropping' && 'Ball Dropping...'}
                    {betStatus === 'settling' && 'Settling...'}
                    {betStatus === 'idle' && 'BET'}
                </button>

                {betAmount > balance && (
                    <div className={styles.errorMessage} role="alert">
                        Insufficient balance
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameConfig;
