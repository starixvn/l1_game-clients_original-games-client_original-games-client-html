import React, { useEffect, useState } from "react";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { BaccaratGameLogic } from "../baccarat-helper";
import { BaccaratHistoryResult } from "./types";
import styles from "./baccarat-result-history.module.scss";
import { BaccaratBetOptions } from "../baccarat-multiplayer-constants";
import { CardSection } from "./card-section";

interface BaccaratResultHistoryProps {
    className?: string;
    maxResults?: number;
    language?: string;
}

const BaccaratResultHistory: React.FC<BaccaratResultHistoryProps> = ({ className, maxResults = 20, language = "en" }) => {
    const gameState = useGameStateContext();
    const [results, setResults] = useState<BaccaratHistoryResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (gameState?.roundHistory) {
            const processedResults = gameState.roundHistory.slice(-maxResults).map((round: any) => ({
                roundId: round.roundId || 0,
                player: round.player || [],
                banker: round.banker || [],
                winner: round.winner || "tie",
                playerTotal: BaccaratGameLogic.getBaccaratTotal(round.player || []),
                bankerTotal: BaccaratGameLogic.getBaccaratTotal(round.banker || []),
            }));

            setResults(processedResults);
            setIsLoading(false);
        } else {
            // No round history available - show empty state
            setResults([]);
            setIsLoading(false);
        }
    }, [gameState, maxResults]);

    const getResultText = (result: BaccaratHistoryResult): string[] => {
        const resultArray: string[] = [];

        if (result.winner === BaccaratBetOptions.PLAYER) {
            resultArray.push("Player");
        }
        if (result.winner === BaccaratBetOptions.BANKER) {
            resultArray.push("Banker");
        }
        if (result.winner === BaccaratBetOptions.TIE) {
            resultArray.push("Tie");
        }

        return resultArray;
    };

    const renderResultWithBreaks = (texts: string[]) => {
        return texts.map((text, index) => (
            <React.Fragment key={index}>
                {text}
                {index < texts.length - 1 && (
                    <>
                        , <br />
                    </>
                )}
            </React.Fragment>
        ));
    };

    const renderRoundResult = (result: BaccaratHistoryResult, index: number) => {
        const resultTexts = getResultText(result);
        const resultString = language === "th" ? renderResultWithBreaks(resultTexts) : resultTexts.join(", ");

        return (
            <div className={styles.historyRow} key={index}>
                <div className={styles.contentWrapper}>
                    <span className={styles.roundNumber}>Round {result.roundId}</span>
                    <CardSection
                        cards={result.player}
                        label="Player"
                        type="player"
                        playResultAnimation={false}
                        isShowResult={true}
                        isHideAllCards={false}
                    />
                    <span className={styles.divider} />
                    <CardSection
                        cards={result.banker}
                        label="Banker"
                        type="banker"
                        playResultAnimation={false}
                        isShowResult={true}
                        isHideAllCards={false}
                    />
                    <span className={styles.winner}>{resultString}</span>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`${styles.resultHistoryContainer} ${className || ""}`}>
                <div className={styles.loading}>Loading result history...</div>
            </div>
        );
    }

    return (
        <div className={`${styles.resultHistoryContainer} ${className || ""}`}>
            <div className={styles["result-title"]}>Result History</div>
            <div className={`${styles.resultHistory}`}>
                <div className={styles.header}>
                    <span />
                    <span>Player</span>
                    <span />
                    <span>Banker</span>
                    <span />
                </div>
                <div className={styles.historyContent}>{results.map((result, index) => renderRoundResult(result, index))}</div>
            </div>
        </div>
    );
};

export default BaccaratResultHistory;
