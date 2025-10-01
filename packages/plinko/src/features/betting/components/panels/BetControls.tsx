import React from 'react';
import { BetControlsProps } from '../../../../shared/types';
import styles from './BetControls.module.scss';
import { logger } from '../../../../services';
import {
    BetAmountInput,
    GameModeSelector,
    RowsSelector,
    NumberOfBetsSelector,
    OnWinControls,
    OnLossControls,
    StopOnWinControls,
    StopOnLossControls,
} from '../index';

const BetControls: React.FC<BetControlsProps> = ({
    betAmount,
    gameMode,
    rows,
    numberOfBets,
    onWinAction,
    onWinPercentage,
    onLossAction,
    onLossPercentage,
    stopOnWin,
    stopOnLoss,
    activeTab,
    onBetAmountChange,
    onGameModeChange,
    onRowsChange,
    onNumberOfBetsChange,
    onWinActionChange,
    onWinPercentageChange,
    onLossActionChange,
    onLossPercentageChange,
    onStopOnWinChange,
    onStopOnLossChange,
}) => {

    return (
        <div
            className="setting-bet-amount"
        >
            <div className={styles.betControlsHeader}>
                <div className={`${styles.modeIndicator} ${styles[activeTab.toLowerCase()]}`}>
                    <span className={styles.modeText}>{activeTab} Mode</span>
                </div>
            </div>
            <div className="total-bet">
                <BetAmountInput
                    betAmount={betAmount}
                    onBetAmountChange={onBetAmountChange}
                />

                <GameModeSelector
                    gameMode={gameMode}
                    onGameModeChange={onGameModeChange}
                />

                <RowsSelector
                    rows={rows}
                    onRowsChange={onRowsChange}
                />

                {activeTab === 'Auto' && (
                    <>
                        <NumberOfBetsSelector
                            numberOfBets={numberOfBets}
                            onNumberOfBetsChange={onNumberOfBetsChange}
                        />

                        <OnWinControls
                            onWinAction={onWinAction}
                            onWinPercentage={onWinPercentage}
                            onWinActionChange={onWinActionChange}
                            onWinPercentageChange={onWinPercentageChange}
                        />

                        <OnLossControls
                            onLossAction={onLossAction}
                            onLossPercentage={onLossPercentage}
                            onLossActionChange={onLossActionChange}
                            onLossPercentageChange={onLossPercentageChange}
                        />

                        <StopOnWinControls
                            stopOnWin={stopOnWin}
                            onStopOnWinChange={onStopOnWinChange}
                        />

                        <StopOnLossControls
                            stopOnLoss={stopOnLoss}
                            onStopOnLossChange={onStopOnLossChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default BetControls;


