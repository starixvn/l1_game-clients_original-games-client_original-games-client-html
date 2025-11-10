import { cn, separateDateTime, useGameContext, useTranslator } from "@shared";
import { TableCell, TableRow } from "@shared/components/game-components/table";
import { useBetDetailStore } from "@shared/stores";
import { memo } from "react";

const BaccaratMultiplayerBetDetailBodyItem = ({ data }: { data: any }) => {
    const betDetailData = useBetDetailStore((state) => state.data);
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);
    if (!data || !betDetailData) {
        return null;
    }
    const { odds, settlementResult } = betDetailData;
    const isWinningBet = (choice: string) => {
        return settlementResult?.[choice] === true;
    };
    const getWinAmount = (choice: string) => {
        // Standard win calculation
        let winAmount = settlementResult?.[choice] ? amount * odds[choice] : 0;

        // Special case for Baccarat: when tie wins, return player/banker bet amounts
        if (settlementResult.tie && (choice === "player" || choice === "banker")) {
            winAmount += amount; // Return the original bet amount
        }

        return winAmount;
    };
    const { choice, amount } = data;
    const isWin = isWinningBet(choice);
    const { time } = separateDateTime(data.time);
    const rowData = [
        {
            content: time,
            isWinningBet: false,
        },
        {
            content: <span className="font-text flex justify-center items-center">{t(`glossary_${choice.toLowerCase()}`)}</span>,
            isWinningBet: isWin,
            className: "font-semibold",
        },
        {
            content: amount,
            isWinningBet: false,
        },
        {
            content: getWinAmount(choice),
            isWinningBet: isWin,
            className: "text-right",
        },
    ];
    return (
        <TableRow className="border-none">
            {rowData.map((cell, cellIndex) => (
                <TableCell
                    key={cellIndex}
                    className={cn(
                        "text-sm md:text-base text-secondary-text p-3 text-center",
                        cell.className,
                        cell.isWinningBet && "text-winning-highlight font-normal"
                    )}
                >
                    {cell.content}
                </TableCell>
            ))}
        </TableRow>
    );
};

export default memo(BaccaratMultiplayerBetDetailBodyItem);
