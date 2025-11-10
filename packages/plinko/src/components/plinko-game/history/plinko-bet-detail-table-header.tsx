import { Table, TableHead, TableHeader, TableRow } from "@shared/components/game-components/table";
import { cn } from "@shared/utils";
import { memo } from "react";
import { useTranslator } from "@shared/react-hooks";
import { ResourceTypes } from "@shared/resources";
import { useBetDetailStore } from "@shared/stores";
import { GAME_MODES } from "@plinko/constants";

const PlinkoBetDetailTableHeader = () => {
    const { t } = useTranslator([ResourceTypes.PLINKO]);

    const data = useBetDetailStore((state) => state.data);
    const isLightningMode = data.gameMode === GAME_MODES.LIGHTNING && !!data.lightningBoard;

    const headerColumns = [
        {
            key: "header1",
            label: t(isLightningMode ? `${ResourceTypes.PLINKO}.payout_slot` : `${ResourceTypes.PLINKO}.mode`).capitalizeFirstLetter(),
        },
        {
            key: "header2",
            label: t(
                isLightningMode ? `${ResourceTypes.COMMON}.title_total_multiplier` : `${ResourceTypes.PLINKO}.row`
            ).capitalizeFirstLetter(),
        },
        { key: "stake", label: t(`${ResourceTypes.COMMON}.bet_amount`).capitalizeFirstLetter() },
        { key: "win", label: t(`${ResourceTypes.COMMON}.win`).capitalizeFirstLetter(), align: "right" },
    ];

    return (
        <div className="bg-table-header rounded-t-lg shrink-0 pr-3">
            <Table className="rounded-t-lg w-full table-fixed">
                <TableHeader className="sticky top-0 z-10 bg-table-header">
                    <TableRow>
                        {headerColumns.map((column, index) => (
                            <TableHead
                                key={column.key}
                                className={cn(
                                    "py-3 px-0 font-semibold text-white rounded-t-lg border-b border-primary-border text-sm md:text-base",
                                    column.align === "right" ? "text-right" : "text-center"
                                )}
                            >
                                {column.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
            </Table>
        </div>
    );
};

export default memo(PlinkoBetDetailTableHeader);
