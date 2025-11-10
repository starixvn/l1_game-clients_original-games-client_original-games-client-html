import { memo, useMemo } from "react";
import { useCommonTranslate } from "@shared/react-hooks";
import { cn } from "@shared/utils";
import { Table, TableHead, TableHeader, TableRow } from "../table";

const BetDetailTableHeader = ({ customHeaderLabels }: { customHeaderLabels?: string[] }) => {
    const { t: translateCommon } = useCommonTranslate();

    const defaultHeaderLabels = useMemo(() => {
        return ["time", "bet_choice", "bet_amount", "win"].map((label) => translateCommon(label).capitalizeFirstLetter());
    }, [translateCommon]);

    const headers = customHeaderLabels || defaultHeaderLabels;

    return (
        <div className="bg-table-header rounded-t-lg shrink-0 pr-3">
            <Table className="rounded-t-lg w-full table-fixed">
                <TableHeader className="sticky top-0 z-10 bg-table-header">
                    <TableRow>
                        {headers.map((label, index) => (
                            <TableHead
                                key={index}
                                className={cn(
                                    "py-3 px-0 font-semibold text-white rounded-t-lg border-b border-primary-border text-sm md:text-base text-center",
                                    index === headers.length - 1 && "text-right"
                                )}
                            >
                                {label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
            </Table>
        </div>
    );
};

export default memo(BetDetailTableHeader);
