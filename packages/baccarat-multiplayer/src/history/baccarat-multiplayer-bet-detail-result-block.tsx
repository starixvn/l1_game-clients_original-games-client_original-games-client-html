import { FC, memo } from "react";
import { BaccaratCard, BaccaratResult } from "@/result-block/types";
import { useGameContext } from "@shared/react-contexts/game-context/game-context";
import { useCommonTranslate, useTranslator } from "@shared/react-hooks";
import { useBetDetailStore } from "@shared/stores/bet-detail-store";
import Card from "@/shared/components/card";

const BaccaratMultiplayerBetDetailResultBlock = () => {
    const { t: translateCommon } = useCommonTranslate();
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);
    const betDetailData = useBetDetailStore((state) => state.data);
    if (!betDetailData) {
        return null;
    }
    const { player, banker } = betDetailData.result as BaccaratResult;
    const playerCards = [player.card1, player.card2, player.card3];
    const bankerCards = [banker.card1, banker.card2, banker.card3];
    return (
        <div className="flex justify-between text-secondary-text text-sm md:text-base mt-2">
            <div className="flex items-center gap-1.5 font-medium">
                {translateCommon("round").capitalizeFirstLetter()}: <span>{betDetailData.roundId}</span>
            </div>
            <div className="flex items-start gap-3">
                <SideResult title={t("glossary_player")} color="#0990FF" cards={playerCards} />
                <SideResult title={t("glossary_banker")} color="#CC261F" cards={bankerCards} />
            </div>
        </div>
    );
};
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
const SideResult: FC<{ title: string; color: string; cards: BaccaratCard[] }> = ({ title, color, cards }) => (
    <div className="flex flex-col items-center gap-1">
        <div className={`text-xs md:text-sm font-bold uppercase`} style={{ color }}>
            {title}
        </div>
        <div className="flex items-center justify-center w-[86px] gap-1">
            {cards.map((card, idx) => card && <CardDisplay key={idx} card={card} />)}
        </div>
    </div>
);

export default memo(BaccaratMultiplayerBetDetailResultBlock);
