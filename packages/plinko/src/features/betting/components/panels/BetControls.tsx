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
    const handleStylesLog = (element: HTMLElement | null, componentName: string) => {
        if (element) {
            const styles = window.getComputedStyle(element);
            logger.info(`BetControls ${componentName} computed styles`, {
                width: styles.width,
                height: styles.height,
                position: styles.position,
                display: styles.display,
                flexDirection: styles.flexDirection,
                alignItems: styles.alignItems,
                className: element.className
            });
        }
    };

    return (
        <div
            className="setting-bet-amount"
            ref={(el) => handleStylesLog(el, 'main container')}
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


