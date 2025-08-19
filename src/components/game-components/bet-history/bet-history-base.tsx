import { FC, ReactNode, useEffect, useState } from "react";

import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { useGameContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks";
import { messageEventType } from "../../game-base/handlers";
import { LoadingSpinner } from "../game-loading/loading-spinner";
import { InfiniteTable } from "../infinite-table";
import Styles from "./bet-history.module.scss";
import { usePFStore } from "../../../_shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/react/shallow";

const GET_HISTORY = "getHistory";
const HISTORY_EVENT = "history";

export interface BetLog {
    drawId: number;
    result: any;
    odds: number;
    settlementResult: any;
    pfResult: any;
    clientSeed: string;
}

export interface BetHistoryProps {
    isTurnBase: boolean;
    renderBetLogResult: (result: any) => ReactNode;
}

const BetHistoryBase: FC<BetHistoryProps> = ({ renderBetLogResult, isTurnBase }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();

    const dispatch = useGameStatesDispatch();
    const { gameMessageHandler } = useGameContext();

    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [isHaveMoreData, setIsHaveMoreData] = useState<boolean>(true);
    const [betLogs, setBetLogs] = useState([]);
    const [page, setPage] = useState<number>(1);

    const clickSound = useClickSound();
    const { updatePFVerify } = usePFStore(useShallow((state) => ({
        updatePFVerify: state.updatePFVerify,
    })));

    const getHistory = (historyPage: number) => {
        gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE]: { event: GET_HISTORY, data: { page: historyPage } },
        });
    };

    useEffect(() => {
        setIsFetching(true);

        const historyHandler = gameMessageHandler.register(HISTORY_EVENT, ({ history }) => {
            setIsFetching(false);
            if (history?.betLogs?.length > 0) {
                setBetLogs((x) => [...x, ...(history?.betLogs ?? [])]);
            } else {
                setIsHaveMoreData(false);
            }
        });

        return () => {
            gameMessageHandler.removeHandler(historyHandler);
        };
    }, []);

    useEffect(() => {
        getHistory(page);
    }, [page]);

    const addData = () => {
        setPage((page) => page + 1);
    };

    const handleClickDrawId = (betLogDetail: BetLog) => {
        clickSound();
        dispatch({
            type: GameEventActionType.UPDATE_BET_DETAIL,
            payload: {
                betDetailModalData: {
                    ...betLogDetail,
                    drawInfo: {
                        drawId: betLogDetail?.drawId,
                        result: betLogDetail?.result,
                        odds: betLogDetail?.odds,
                        settlementResult: betLogDetail?.settlementResult,
                        pfResult: betLogDetail?.pfResult,
                        clientSeed: betLogDetail?.clientSeed,
                    },
                },
            },
        });
        dispatch({
            type: GameEventActionType.TOGGLE_BET_DETAIL,
            payload: {
                isShowBetDetail: true,
            },
        });
        updatePFVerify(betLogDetail?.pfResult);
    };

    const header = [
        { node: translateCommon("time") },
        {
            node: isTurnBase ?
                translateSNGames("glossary_draw_id").capitalizeFirstLetter() :
                translateCommon("round").capitalizeFirstLetter()
        },
        { node: <>{translateCommon("result")}</> },
        { node: translateCommon("total_stake") },
        { node: translateCommon("win") },
    ];

    const betLogsWithSettleTime = betLogs.map((item) => {
        const mappedDrawId = item?.drawId ?? item?.roundId ?? item?.phien;
        return {
            ...item,
            drawId: mappedDrawId,
            time: item?.time,
        };
    });

    const preprocessedBetLogs = sortedCollectionByTime(betLogsWithSettleTime);
    const body = preprocessedBetLogs?.map((item) => {
        const { drawId, result, totalAmount, betwin } = item;
        const { date, time } = separateDateTime(item.time);

        return [
            {
                node: (
                    <>
                        {time} <br />
                        {date}
                    </>
                ),
            },
            {
                node: (
                    <button className="clickable" onClick={() => handleClickDrawId(item)}>
                        {drawId}
                    </button>
                ),
            },
            {
                node: renderBetLogResult(result),
            },
            { node: numberWithCommas(totalAmount) },
            { node: <div className={betwin > 0 ? "highlight" : ""}>{numberWithCommas(betwin)}</div> },
        ];
    });

    return isFetching ? (
        <LoadingSpinner />
    ) : (
        <InfiniteTable
            header={header}
            body={body}
            customTableContainerStyles={Styles["history"]}
            addData={addData}
            isAddData={isHaveMoreData}
            noData={betLogs.length <= 0}
        />
    );
};

export default BetHistoryBase;
