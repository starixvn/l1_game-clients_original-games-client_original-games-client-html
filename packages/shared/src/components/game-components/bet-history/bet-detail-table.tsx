import { memo } from "react";
import BetDetailTableHeader from "./bet-detail-table-header";
import BetDetailTableSummary from "./bet-detail-table-summary";
import { Table } from "../table";
import { TableBody } from "../table";
import { useBetDetailStore } from "@shared/stores";
import BetDetailTableBodyItem from "./bet-detail-table-body-item";

const BetDetailTable: React.FC<any> = ({
    Header = BetDetailTableHeader,
    BodyItem = BetDetailTableBodyItem,
    Summary = BetDetailTableSummary,
    isShowSummary = true,
}) => {
    const betDetailData = useBetDetailStore((state) => state.data);
    return (
        <div className="flex flex-col h-full w-full">
            <Header />

            <div className="overflow-y-auto w-full max-h-[calc(100%-92px)]">
                <Table className="w-full pr-3 table-striped table-fixed">
                    <TableBody>
                        {betDetailData?.betLogDetails?.map((row, index) => (
                            <BodyItem key={index} data={row} />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {isShowSummary && <Summary />}
        </div>
    );
};

export default memo(BetDetailTable);
