import React, { memo } from "react";
import PlayerBankerResultComponent from "./player-banker-result";

interface Result {
    player: {
        card1: { card: number; type: number };
        card2: { card: number; type: number };
        card3?: { card: number; type: number };
    };
    banker: {
        card1: { card: number; type: number };
        card2: { card: number; type: number };
        card3?: { card: number; type: number };
    };
    winner: 'player' | 'banker' | 'tie';
    playerPair?: boolean;
    bankerPair?: boolean;
    natural?: boolean;
}

interface CardDisplayProps {
    result: Result;
    isAnimationResult: boolean;
    isShowResult: boolean;
    language: string;
    isFinishShowResult: boolean;
    isHideAllCards: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = memo(
    ({ result, isAnimationResult, isShowResult, language, isFinishShowResult, isHideAllCards }) => {
        console.log('[CardDisplay] props:', { isAnimationResult, isShowResult, language, isFinishShowResult, isHideAllCards });
        console.log('[CardDisplay] result:', result);
        return (
            <PlayerBankerResultComponent
                playResultAnimation={isAnimationResult}
                result={result}
                isShowResult={isShowResult}
                language={language}
                isFinishShowResult={isFinishShowResult}
                isHideAllCards={isHideAllCards}
            />
        );
    },
);

CardDisplay.displayName = 'CardDisplay';
