import React from 'react';
import styles from './PayoutsDisplay.module.scss';

interface PayoutsDisplayProps {
    multipliers: number[];
    probabilities: number[];
    betAmount: number;
    rows: number;
    className?: string;
}

const getMultiplierClass = (multiplier: number): string => {
    if (multiplier >= 10) {
        return styles.high;
    }
    if (multiplier >= 5) {
        return styles.medium;
    }
    if (multiplier >= 2) {
        return styles.low;
    }
    return styles.none;
};

const PayoutsDisplay: React.FC<PayoutsDisplayProps> = ({
    multipliers,
    probabilities,
    betAmount,
    rows,
    className = ''
}) => {
    const [hoveredSlot, setHoveredSlot] = React.useState<number | null>(null);

    // Calculate estimated win for a slot
    const calculateWin = (multiplier: number): number => {
        return betAmount * multiplier;
    };

    // Format probability as percentage
    const formatProbability = (probability: number): string => {
        return (probability * 100).toFixed(1);
    };

    if (!multipliers || multipliers.length === 0) {
        return (
            <div className={`${styles.payoutsContainer} ${className}`}>
                <div style={{ color: 'white', padding: '10px', fontSize: '12px' }}>
                    Loading payouts...
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.payoutsContainer} ${className}`}>
            {multipliers.map((multiplier, index) => {
                const probability = probabilities[index] || 0;
                const winAmount = calculateWin(multiplier);
                const multiplierClass = getMultiplierClass(multiplier);

                return (
                    <div
                        key={`payout-${rows}-${index}`}
                        className={`${styles.payoutSlot} ${multiplierClass}`}
                        style={{ opacity: Math.max(0.6, probability) }}
                        onMouseEnter={() => setHoveredSlot(index)}
                        onMouseLeave={() => setHoveredSlot(null)}
                    >
                        <div className={styles.multiplierText}>
                            {multiplier.toFixed(1)}x
                        </div>
                        <div className={styles.winAmountText}>
                            ${winAmount.toFixed(0)}
                        </div>
                        <div className={styles.probabilityText}>
                            {formatProbability(probability)}%
                        </div>

                        <div className={`${styles.tooltip} ${hoveredSlot === index ? styles.visible : styles.hidden}`}>
                            <div>Multiplier: {multiplier.toFixed(1)}x</div>
                            <div>Win: ${winAmount.toFixed(2)}</div>
                            <div>Chance: {formatProbability(probability)}%</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PayoutsDisplay;
