import { memo, useMemo } from "react";
import { useCommonTranslate } from "@shared/react-hooks";
import { cn } from "@shared/utils";
import { Table, TableHead, TableHeader, TableRow } from "../table";

const BetHistoryHeader = ({ customHeaderLabels }: { customHeaderLabels?: string[] }) => {
    const { t: translateCommon } = useCommonTranslate();

    const defaultHeaderLabels = useMemo(() => {
        return ["time", "round", "bet_amount", "win"].map((label) => translateCommon(label).capitalizeFirstLetter());
    }, [translateCommon]);

    const headers = customHeaderLabels || defaultHeaderLabels;

    return (
        <Table className="bet-history-table table-fixed sticky top-[50px] lg:static lg:top-0">
            <TableHeader>
                <TableRow className="bg-table-header border-none h-[36px] rounded-lg">
                    {headers.map((label, index) => (
                        <TableHead
                            key={index}
                            className={cn(
                                "text-primary-text p-2 md:p-3 h-full font-semibold text-sm md:text-base text-center",
                                index === headers.length - 1 && "text-right rounded-r-lg",
                                index === 0 && "rounded-l-lg"
                            )}
                        >
                            {label}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
        </Table>
    );
};

export default memo(BetHistoryHeader);
