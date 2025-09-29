import { useState, useEffect } from 'react';

export interface BetDetails {
    gameMode: string;
    rows: number;
    betAmount: number;
    timestamp: number;
    status: 'pending' | 'accepted' | 'settled';
}

export interface UseBetLogicProps {
    gameMode: string;
    rows: number;
    betAmount: number;
    balance: number;
    onBetPlaced: (betDetails: BetDetails) => void;
    onBalanceUpdate?: (newBalance: number) => void;
}

export interface UseBetLogicReturn {
    betStatus: 'idle' | 'placing' | 'accepted' | 'dropping' | 'settling';
    isPanelDisabled: boolean;
    currentBetId: string | null;
    isBetButtonDisabled: boolean;
    handlePlaceBet: () => Promise<void>;
}

export const useBetLogic = ({
    gameMode,
    rows,
    betAmount,
    balance,
    onBetPlaced,
    onBalanceUpdate,
}: UseBetLogicProps): UseBetLogicReturn => {
    const [betStatus, setBetStatus] = useState<'idle' | 'placing' | 'accepted' | 'dropping' | 'settling'>('idle');
    const [isPanelDisabled, setIsPanelDisabled] = useState(false);
    const [currentBetId, setCurrentBetId] = useState<string | null>(null);

    // Polling for bet status updates
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (currentBetId && betStatus !== 'idle') {
            intervalId = setInterval(async () => {
                try {
                    const response = await fetch(`/api/bet-status?betId=${currentBetId}`);
                    const result = await response.json();

                    if (result.success) {
                        const newStatus = result.status;

                        if (newStatus !== betStatus) {
                            setBetStatus(newStatus);

                            // Update balance if provided
                            if (result.currentBalance !== undefined && onBalanceUpdate) {
                                onBalanceUpdate(result.currentBalance);
                            }

                            // Handle settlement completion
                            if (newStatus === 'settled') {
                                setTimeout(() => {
                                    setBetStatus('idle');
                                    setIsPanelDisabled(false);
                                    setCurrentBetId(null);
                                }, 1000);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error polling bet status:', error);
                }
            }, 1000); // Poll every second
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [currentBetId, betStatus, onBalanceUpdate]);

    const handlePlaceBet = async () => {
        if (betStatus !== 'idle' || betAmount > balance) {
            return;
        }

        setBetStatus('placing');

        try {
            const response = await fetch('/api/place-bet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameMode,
                    rows,
                    betAmount,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setCurrentBetId(result.betId);
                setIsPanelDisabled(true);

                const betDetails: BetDetails = {
                    gameMode,
                    rows,
                    betAmount,
                    timestamp: Date.now(),
                    status: 'pending',
                };

                onBetPlaced(betDetails);

                // Update balance immediately after bet placement
                if (result.newBalance !== undefined && onBalanceUpdate) {
                    onBalanceUpdate(result.newBalance);
                }
            } else {
                setBetStatus('idle');
                console.error('Bet placement failed:', result.error);
            }
        } catch (error) {
            console.error('Bet placement error:', error);
            setBetStatus('idle');
        }
    };

    const isBetButtonDisabled = betStatus !== 'idle' || betAmount > balance || betAmount <= 0;

    return {
        betStatus,
        isPanelDisabled,
        currentBetId,
        isBetButtonDisabled,
        handlePlaceBet,
    };
};
