import React, { useEffect, useState } from "react";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { BaccaratGameLogic } from "../baccarat-helper";
import { BaccaratDot } from "./baccarat-dot";
import styles from "./baccarat-round-history.module.scss";

interface BaccaratRoundHistoryProps {
    className?: string;
    maxRounds?: number;
}

interface RoundHistoryItem {
    roundId: number;
    player: any[];
    banker: any[];
    winner: 'player' | 'banker' | 'tie';
    playerTotal: number;
    bankerTotal: number;
    isNatural?: boolean;
    playerPair?: boolean;
    bankerPair?: boolean;
}

const BaccaratRoundHistory: React.FC<BaccaratRoundHistoryProps> = ({
    className,
    maxRounds = 10
}) => {
    const gameState = useGameStateContext();
    const [history, setHistory] = useState<RoundHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (gameState?.roundHistory) {
            const processedHistory = gameState.roundHistory
                .slice(-maxRounds)
                .map((round: any) => ({
                    roundId: round.roundId || 0,
                    player: round.player || [],
                    banker: round.banker || [],
                    winner: round.winner || 'tie',
                    playerTotal: BaccaratGameLogic.getBaccaratTotal(round.player || []),
                    bankerTotal: BaccaratGameLogic.getBaccaratTotal(round.banker || []),
                    isNatural: round.isNatural || false,
                    playerPair: round.playerPair || false,
                    bankerPair: round.bankerPair || false,
                }));

            setHistory(processedHistory);
            setIsLoading(false);
        } else {
            // Mock data for development
            const mockHistory: RoundHistoryItem[] = [
                { roundId: 1, player: [7, 2], banker: [6, 3], winner: 'tie', playerTotal: 9, bankerTotal: 9 },
                { roundId: 2, player: [9, 1], banker: [8, 2], winner: 'player', playerTotal: 0, bankerTotal: 0 },
                { roundId: 3, player: [5, 4], banker: [6, 4], winner: 'banker', playerTotal: 9, bankerTotal: 0 },
                { roundId: 4, player: [3, 7], banker: [2, 8], winner: 'tie', playerTotal: 0, bankerTotal: 0 },
                { roundId: 5, player: [1, 9], banker: [3, 7], winner: 'player', playerTotal: 0, bankerTotal: 0 },
            ];
            setHistory(mockHistory);
            setIsLoading(false);
        }
    }, [gameState, maxRounds]);

    const getWinningChoice = (round: RoundHistoryItem): 'player' | 'banker' | 'tie' => {
        return round.winner;
    };

    const renderHistoryItem = (round: RoundHistoryItem, index: number) => {
        const winningChoice = getWinningChoice(round);

        return (
            <div key={round.roundId} className={styles['history-item']}>
                <BaccaratDot
                    choice={winningChoice}
                    value={winningChoice.charAt(0).toUpperCase()}
                />
                <span className={styles['arrow']}></span>
                <div className={styles['tooltip']}>
                    <div className={styles['tooltip-content']}>
                        <div className={styles['round-info']}>
                            Round {round.roundId}
                        </div>
                        <div className={styles['scores']}>
                            <span className={styles['player-score']}>
                                Player: {round.playerTotal}
                            </span>
                            <span className={styles['banker-score']}>
                                Banker: {round.bankerTotal}
                            </span>
                        </div>
                        {round.isNatural && (
                            <div className={styles['natural']}>Natural!</div>
                        )}
                        {(round.playerPair || round.bankerPair) && (
                            <div className={styles['pairs']}>
                                {round.playerPair && <span>Player Pair</span>}
                                {round.bankerPair && <span>Banker Pair</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`${styles['round-history']} ${className || ""}`}>
                <div className={styles['loading']}>Loading round history...</div>
            </div>
        );
    }

    return (
        <div className={`${styles['round-history']} ${className || ""}`}>
            <div className={styles['round']}>
                <div className={styles['text']}>Previous Rounds:</div>
                {history.slice().reverse().map((round, index) =>
                    renderHistoryItem(round, index)
                )}
                <BaccaratDot highlight={true} value={'?'} choice="next" />
            </div>
        </div>
    );
};

export default BaccaratRoundHistory;
