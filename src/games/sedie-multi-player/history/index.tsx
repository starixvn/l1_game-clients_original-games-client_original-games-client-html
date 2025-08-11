import { FC } from "react";

import BetDetailBase from "../../../components/game-components/bet-history/bet-detail-base";
import BetDetailModal from "../../../components/game-components/bet-history/bet-detail-modal";
import BetHistoryBase from "../../../components/game-components/bet-history/bet-history-base";
import BetHistoryModalBase from "../../../components/game-components/bet-history/bet-history-modal-base";
import { BetChoice, BetDetailResultBlock, produceDataBetDetailRow } from "./sedie-bet-detail-result-block";
import BetLogResultCell from "./sedie-bet-log-result-cell";

const SeDieBetHistoryModal: FC = () => {
    return (
        <>
            <BetHistoryModalBase>
                <BetHistoryBase isTurnBase={false} renderBetLogResult={(result) => <BetLogResultCell result={result} />} />
            </BetHistoryModalBase>
            <BetDetailModal>
                <BetDetailBase
                    isTurnBase={false}
                    renderBetDetailResultBlock={(drawInfo) => <BetDetailResultBlock roundInfo={drawInfo as any} />}
                    produceDataBetDetailRow={produceDataBetDetailRow}
                    renderBetChoice={(choice) => <BetChoice choice={choice} />}
                />
            </BetDetailModal>
        </>
    );
};

export default SeDieBetHistoryModal;


