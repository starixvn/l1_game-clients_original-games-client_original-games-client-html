import { GAME_MODES } from "@plinko/constants";
import { useBetDetailStore } from "@shared/stores";
import { useTranslator } from "@shared/react-hooks";
import { ResourceTypes } from "@shared/resources";
import { memo } from "react";
import { cn } from "@shared/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@shared/components/game-components/table";

const PlinkoBetDetailTableLightning = () => {
    const data = useBetDetailStore((state) => state.data);
    const { t } = useTranslator([ResourceTypes.PLINKO]);

    const { gameMode, lightningBoard, settlementResult } = data;
    const isLightningMode = gameMode === GAME_MODES.LIGHTNING && !!lightningBoard;
    if (!isLightningMode || !lightningBoard.pegMultipliers?.length) {
        return null;
    }
    const { pegMultipliers } = lightningBoard;
    const reachedPegMultipliers = settlementResult.reachedPegMultipliers;

    const isReachedPeg = (peg: any) => {
        if (!reachedPegMultipliers || reachedPegMultipliers.length === 0) {
            return false;
        }
        return reachedPegMultipliers.some(
            (reachedPeg: any) => reachedPeg.row === peg.row && reachedPeg.column === peg.column && reachedPeg.multiplier === peg.multiplier
        );
    };

    const headers = [
        {
            key: "column",
            label: t(`${ResourceTypes.PLINKO}.column`).capitalizeFirstLetter(),
        },
        {
            key: "row",
            label: t(`${ResourceTypes.PLINKO}.row`).capitalizeFirstLetter(),
        },
        {
            key: "multiplier",
            label: t(`${ResourceTypes.COMMON}.title_multiplier`).capitalizeFirstLetter(),
        },
    ];

    return (
        <div className="mt-4">
            <div className="font-semibold py-3 text-sm md:text-base">
                {t(`${ResourceTypes.PLINKO}.multiplier_position`).capitalizeFirstLetter()}
            </div>
            <div className="bg-table-header rounded-lg">
                <Table className="rounded-lg w-full table-fixed table-striped">
                    <TableHeader className="sticky top-0 z-10 bg-table-header">
                        <TableRow>
                            {headers.map((header) => (
                                <TableHead
                                    key={header.key}
                                    className="py-3 px-0 font-semibold text-white rounded-t-lg border-b border-primary-border text-sm md:text-base text-center"
                                >
                                    {header.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="rounded-b-lg">
                        {pegMultipliers.map((peg, index) => {
                            const reached = isReachedPeg(peg);
                            const tableCellStyles = cn(
                                "text-sm md:text-base text-center p-3",
                                reached ? "text-winning-highlight" : "text-secondary-text"
                            );
                            return (
                                <TableRow key={index} className="border-none">
                                    <TableCell className={cn(tableCellStyles, index === pegMultipliers.length - 1 && "rounded-bl-lg")}>
                                        {peg.column + 2}
                                    </TableCell>
                                    <TableCell className={tableCellStyles}>{peg.row + 1}</TableCell>
                                    <TableCell className={cn(tableCellStyles, index === pegMultipliers.length - 1 && "rounded-br-lg")}>
                                        {peg.multiplier}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default memo(PlinkoBetDetailTableLightning);
