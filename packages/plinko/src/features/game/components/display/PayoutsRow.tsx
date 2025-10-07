import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { PayoutsRowProps } from '../../../../shared/types';
import { useGameStore } from '@shared/stores/game-store';

// Map string game mode values to numeric values expected by getOddsForMode
const mapGameModeToNumber = (gameMode: PayoutsRowProps['gameMode']): number => {
    switch (gameMode) {
        case 'Low':
            return 0;
        case 'Medium':
            return 1;
        case 'High':
            return 2;
        case 'Lightning':
            return 2; // Assuming Lightning maps to HIGH (2)
        default:
            return 1; // Default to MEDIUM
    }
};

// Interface for payout data from API
interface PayoutData {
    multipliers: number[];
    probabilities: number[];
}

// Styled components for responsive design
const PayoutsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const PayoutSlot = styled.div<{ $isHovered?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 40px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  }

  @media (max-width: 768px) {
    min-width: 50px;
    height: 35px;
    font-size: 12px;
  }
`;

const Tooltip = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  z-index: 1000;
  margin-bottom: 8px;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 6px 10px;
  }
`;

// Section 3: PayoutsRow Component - Displays bottom row slots with multipliers and hover tooltips
const PayoutsRow: React.FC<PayoutsRowProps> = ({ gameMode, rows, betAmount }) => {
    const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
    const config = useGameStore((state) => state.gameConfigs);
    // Get payout data from odds config
    const payoutData = useMemo(() => {
        try {
            const numericGameMode = mapGameModeToNumber(gameMode);
            const multipliers = config?.odds?.[numericGameMode][rows] as unknown as number[];
            // Generate equal probabilities for all multipliers (this could be improved with actual probability calculations)
            const probabilities = multipliers.map(() => 1 / multipliers.length);
            return {
                multipliers,
                probabilities,
            };
        } catch (error) {
            console.error('Failed to get odds for mode:', { gameMode, rows, error });
            return null;
        }
    }, [gameMode, rows]);

    // Calculate estimated winning amount for tooltip - Section 3 requirement
    const calculateEstimatedWin = (multiplier: number): string => {
        const winAmount = betAmount * multiplier;
        return winAmount.toFixed(2);
    };

    // Format probability as percentage for tooltip - Section 3 requirement
    const formatProbability = (probability: number): string => {
        return (probability * 100).toFixed(2);
    };

    if (!payoutData || !payoutData.multipliers || !payoutData.probabilities) {
        return (
            <PayoutsContainer>
                <div>No payout data available</div>
            </PayoutsContainer>
        );
    }

    return (
        <PayoutsContainer>
            {payoutData.multipliers.map((multiplier, index) => (
                <PayoutSlot
                    key={`slot-${rows}-${gameMode}-${index}`}
                    onMouseEnter={() => setHoveredSlot(index)}
                    onMouseLeave={() => setHoveredSlot(null)}
                >
                    {multiplier.toFixed(1)}x
                    <Tooltip $visible={hoveredSlot === index}>
                        <div>Win: ${calculateEstimatedWin(multiplier)}</div>
                        <div>Probability: {formatProbability(payoutData?.probabilities?.[index] || 0)}%</div>
                    </Tooltip>
                </PayoutSlot>
            ))}
        </PayoutsContainer>
    );
};

export default PayoutsRow;
