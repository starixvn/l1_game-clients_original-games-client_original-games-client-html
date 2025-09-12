import React, { useEffect, useState } from "react";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { BaccaratGameLogic } from "../baccarat-helper";
import { ResultCardSection } from "./result-card-section";
import styles from "./baccarat-result-history.module.scss";

interface BaccaratResultHistoryProps {
    className?: string;
    maxResults?: number;
    language?: string;
}

interface ResultHistoryItem {
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

const BaccaratResultHistory: React.FC<BaccaratResultHistoryProps> = ({
    className,
    maxResults = 20,
    language = 'en'
}) => {
    const gameState = useGameStateContext();
    const [results, setResults] = useState<ResultHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (gameState?.roundHistory) {
            const processedResults = gameState.roundHistory
                .slice(-maxResults)
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

            setResults(processedResults);
            setIsLoading(false);
        } else {
            // Mock data for development
            const mockResults: ResultHistoryItem[] = [
                { roundId: 1, player: [7, 2], banker: [6, 3], winner: 'tie', playerTotal: 9, bankerTotal: 9 },
                { roundId: 2, player: [9, 1], banker: [8, 2], winner: 'player', playerTotal: 0, bankerTotal: 0 },
                { roundId: 3, player: [5, 4], banker: [6, 4], winner: 'banker', playerTotal: 9, bankerTotal: 0 },
                { roundId: 4, player: [3, 7], banker: [2, 8], winner: 'tie', playerTotal: 0, bankerTotal: 0 },
                { roundId: 5, player: [1, 9], banker: [3, 7], winner: 'player', playerTotal: 0, bankerTotal: 0 },
            ];
            setResults(mockResults);
            setIsLoading(false);
        }
    }, [gameState, maxResults]);

    const getResultText = (result: ResultHistoryItem): string[] => {
        const resultArray: string[] = [];

        if (result.winner === 'player') resultArray.push('Player');
        if (result.winner === 'banker') resultArray.push('Banker');
        if (result.winner === 'tie') resultArray.push('Tie');
        if (result.playerPair) resultArray.push('Player Pair');
        if (result.bankerPair) resultArray.push('Banker Pair');

        return resultArray;
    };

    const renderResultWithBreaks = (texts: string[]) => {
        return texts.map((text, index) => (
            <React.Fragment key={index}>
                {text}
                {index < texts.length - 1 && (
                    <>
                        ,{' '}
                        <br />
                    </>
                )}
            </React.Fragment>
        ));
    };

    const renderRoundResult = (result: ResultHistoryItem, index: number) => {
        const resultTexts = getResultText(result);
        const resultString = language === 'th' ?
            renderResultWithBreaks(resultTexts) :
            resultTexts.join(', ');

        return (
            <div className={styles.historyRow} key={index}>
                <div className={styles.contentWrapper}>
                    <span className={styles.roundNumber}>
                        Round {result.roundId}
                    </span>
                    <ResultCardSection cards={result.player} />
                    <span className={styles.divider} />
                    <ResultCardSection cards={result.banker} />
                    <span className={styles.winner}>
                        {resultString}
                    </span>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`${styles.resultHistoryContainer} ${className || ''}`}>
                <div className={styles.loading}>Loading result history...</div>
            </div>
        );
    }

    return (
        <div className={`${styles.resultHistoryContainer} ${className || ''}`}>
            <div className={styles['result-title']}>Result History</div>
            <div className={`${styles.resultHistory}`}>
                <div className={styles.header}>
                    <span />
                    <span>Player</span>
                    <span />
                    <span>Banker</span>
                    <span />
                </div>
                <div className={styles.historyContent}>
                    {results.map((result, index) => renderRoundResult(result, index))}
                </div>
            </div>
        </div>
    );
};

export default BaccaratResultHistory;
