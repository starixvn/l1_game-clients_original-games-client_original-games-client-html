import { FC, useState } from "react";
import { randomBytes } from "crypto";
import Styles from "./infinite-table.module.scss";
import { useSNTranslate } from "../../../_shared/react-hooks";

interface TableRowProps {
    children?: RowContent[];
    isHeader?: boolean;
}

interface RowContent {
    node?: React.ReactNode;
    customAttributes?: React.Attributes;
}

const TableRow: FC<TableRowProps> = ({ children, isHeader }) => {
    return (
        <tr>
            {isHeader
                ? children.map((item, _) => (
                      <th key={randomBytes(10).toString()} {...item.customAttributes}>
                          {item.node}
                      </th>
                  ))
                : children.map((item, _) => (
                      <td key={randomBytes(10).toString()} {...item.customAttributes}>
                          {item.node}
                      </td>
                  ))}
        </tr>
    );
};

export const InfiniteTable: FC<{
    addData?: Function;
    isAddData?: boolean;
    customTableStyles?: string;
    customTableContainerStyles?: string;
    customMessage?: {
        noData?: string;
        noMoreData?: string;
    };
    header: RowContent[];
    body: RowContent[][];
    noData?: boolean;
}> = ({
    customTableStyles = "text-center",
    customTableContainerStyles,
    header,
    body,
    noData = false,
    addData = null,
    customMessage,
    isAddData = false,
}) => {
    const { t: translateSNGames } = useSNTranslate();
    const [isHaveMoreData, setIsHaveMoreData] = useState(true);

    const handleScroll = (event: any) => {
        const bottom = Math.round(event.target.scrollHeight - event.target.scrollTop) === Math.round(event.target.clientHeight);
        if (bottom) {
            if (isAddData) {
                addData();
            }
            setIsHaveMoreData(false);
        }
    };

    return (
        <div className={`table-container react-infinite-table ${customTableContainerStyles}`} onScroll={handleScroll}>
            <table className={`table ${customTableStyles}`}>
                <thead>
                    <TableRow isHeader={true}>{header}</TableRow>
                </thead>
                <tbody>
                    {body.map((row, _) => (
                        <TableRow key={randomBytes(10).toString()}>{row}</TableRow>
                    ))}
                </tbody>
            </table>
            {noData && <div className={Styles["no-more-data"]}>{customMessage?.noData ?? translateSNGames("table_no_data")}</div>}
            {!isHaveMoreData && !noData && (
                <div className={Styles["no-more-data"]}>{customMessage?.noMoreData ?? translateSNGames("table_no_more_data")}</div>
            )}
        </div>
    );
};
