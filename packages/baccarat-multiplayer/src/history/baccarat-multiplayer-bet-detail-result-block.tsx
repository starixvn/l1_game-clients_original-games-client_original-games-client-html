import { DrawInfo } from "@shared/components/game-base/type";
import { BaccaratCard, BaccaratResult } from "../result-block/types";
import { useGameContext } from "@shared/react-contexts";
import { useCommonTranslate, useTranslator } from "@shared/react-hooks";
import { FC } from "react";
import Card from "../shared/components/card";

export interface RoundInfoBaccaratMultiplayer extends DrawInfo {
    roundId: number;
    result: BaccaratResult;
    odds?: Record<string, number>;
    settlementResult: Record<string, boolean>;
}

interface SideResultProps {
    title: string;
    color: string;
    cards: (BaccaratCard | null)[];
}

// Component to display a single card
const CardDisplay: FC<{ card: BaccaratCard | null }> = ({ card }) => {
    if (!card) {
        return <span className="text-secondary-text text-xs">—</span>;
    }

    // Convert BaccaratCard to ObjectResult format expected by Card component
    const cardResult = {
        card: card.rank,
        type: card.suit,
    };

    return (
        <div className="w-[26px] h-[34px]">
            <Card result={cardResult} />
        </div>
    );
};

const calculateWin = (isWin: boolean, amount: number, odds: number, choice: string, settlementResult: Record<string, boolean>): number => {
    // Standard win calculation
    let winAmount = isWin ? amount * odds : 0;

    // Special case for Baccarat: when tie wins, return player/banker bet amounts
    if (settlementResult.tie && (choice === "player" || choice === "banker")) {
        winAmount += amount; // Return the original bet amount
    }

    return winAmount;
};

const SideResult: FC<SideResultProps> = ({ title, color, cards }) => (
    <div className="flex flex-col items-center gap-1">
        <div className={`text-xs md:text-sm font-bold uppercase`} style={{ color }}>
            {title}
        </div>
        <div className="flex items-center justify-center w-[86px] gap-1">
            {cards.map((card, idx) => (
                card && <CardDisplay key={idx} card={card} />
            ))}
        </div>
    </div>
);

export const BetDetailResultBlock: FC<{ roundInfo: RoundInfoBaccaratMultiplayer }> = ({ roundInfo: drawInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);
    const { roundId, result } = drawInfo;

    // Cast result to BaccaratResult since we're only handling baccarat cards
    const baccaratResult = result as BaccaratResult;

    return (
        <div className="flex justify-between text-secondary-text text-sm md:text-base mt-2">
            <div className="flex items-center gap-1.5 font-medium">
                {translateCommon("round").capitalizeFirstLetter()}: <span>{roundId}</span>
            </div>
            <div className="flex items-start gap-3">
                <SideResult
                    title={t("glossary_player")}
                    color="#0990FF"
                    cards={[baccaratResult.player.card1, baccaratResult.player.card2, baccaratResult.player.card3]}
                />
                <SideResult
                    title={t("glossary_banker")}
                    color="#CC261F"
                    cards={[baccaratResult.banker.card1, baccaratResult.banker.card2, baccaratResult.banker.card3]}
                />
            </div>
        </div>
    );
};

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoBaccaratMultiplayer) => {
    const isWin = drawInfo.settlementResult?.[item.choice];
    const odds = drawInfo.odds?.[item.choice];

    const win = calculateWin(isWin, item.amount, odds, item.choice, drawInfo.settlementResult);

    return {
        rawTime: item.time,
        amount: item.amount,
        choice: item.choice,
        odds: odds,
        win,
        hightlight: isWin,
    };
};

export const BetChoice: FC<{ choice: string }> = ({ choice }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);

    return <span className="font-text flex justify-center items-center">{t(`glossary_${choice.toLowerCase()}`)}</span>;
};
