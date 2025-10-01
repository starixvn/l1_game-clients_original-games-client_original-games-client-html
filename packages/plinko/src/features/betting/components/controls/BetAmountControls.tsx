import React from 'react';
import { BetAmountControlsProps } from '../../../../shared/types';
import { BET_CONFIG, formatBetAmount } from './bet-config';
import { logger } from '../../../../services';

const BetAmountControls: React.FC<BetAmountControlsProps> = ({
    betAmount,
    onBetAmountChange,
}) => {
    return (
        <div
            className="title"
        >
            <div className="span-title">
                <span className="span-round-id">Bet Amount</span>
                <span className="input">#123456</span>
            </div>
            <div className="div-frame">
                <div className="span-comma">
                    <span className="div-container">{formatBetAmount(betAmount)}</span>
                </div>
                <div className="div-container-a5">
                    <div className="span-number" onClick={() => onBetAmountChange(Math.max(BET_CONFIG.MIN_BET, betAmount / 2))} role="button" tabIndex={0}>
                        <span className="div-container-a6">1/2</span>
                    </div>
                    <div className="span-number-a7" onClick={() => onBetAmountChange(Math.min(BET_CONFIG.MAX_BET, betAmount * 2))} role="button" tabIndex={0}>
                        <span className="div-container-a8">2x</span>
                    </div>
                    <div className="span-number-a9" onClick={() => onBetAmountChange(BET_CONFIG.MAX_BET)} role="button" tabIndex={0}>
                        <span className="div-container-aa">Max</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BetAmountControls;


