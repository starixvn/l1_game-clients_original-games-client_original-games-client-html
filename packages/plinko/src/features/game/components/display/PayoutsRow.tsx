import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PayoutsRowProps } from '../../../../shared/types';

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
    const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

    // Fetch payouts when mode or rows change - Section 3 requirement
    useEffect(() => {
        const fetchPayouts = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/generate-payouts?mode=${gameMode}&rows=${rows}`);
                const data = await response.json();

                if (data.success) {
                    setPayoutData({
                        multipliers: data.multipliers,
                        probabilities: data.probabilities,
                    });
                } else {
                    setError(data.error || 'Failed to fetch payouts');
                }
            } catch (err) {
                setError('Network error while fetching payouts');
                console.error('Error fetching payouts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayouts();
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

    if (loading) {
        return (
            <PayoutsContainer>
                <div>Loading payouts...</div>
            </PayoutsContainer>
        );
    }

    if (error) {
        return (
            <PayoutsContainer>
                <div style={{ color: 'red' }}>Error: {error}</div>
            </PayoutsContainer>
        );
    }

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
                        <div>Probability: {formatProbability(payoutData.probabilities[index])}%</div>
                    </Tooltip>
                </PayoutSlot>
            ))}
        </PayoutsContainer>
    );
};

export default PayoutsRow;
