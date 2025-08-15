import { FC } from "react";

import BetDetailBase from "../../../components/game-components/bet-history/bet-detail-base";
import BetDetailModal from "../../../components/game-components/bet-history/bet-detail-modal";
import BetHistoryBase from "../../../components/game-components/bet-history/bet-history-base";
import BetHistoryModalBase from "../../../components/game-components/bet-history/bet-history-modal-base";
import { PFVerifyModal } from "../../../components/game-components/provably-fair";
import PFClientSeedInfoModal from "../../../components/game-components/provably-fair/pf-verify/pf-client-seed-info-modal";
import PFVerificationModal from "../../../components/game-components/provably-fair/pf-verify/pf-verification-modal";
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";
import { BetChoice, BetDetailResultBlock, produceDataBetDetailRow } from "./sedie-multiplayer-bet-detail-result-block";
import SedieMultiplayerBetLogResultCell from "./sedie-multiplayer-bet-log-result-cell";

const SeDieBetHistoryModal: FC = () => {
    return (
        <>
            <BetHistoryModalBase>
                <BetHistoryBase isTurnBase={false} renderBetLogResult={(result) => <SedieMultiplayerBetLogResultCell result={result} />} />
            </BetHistoryModalBase>
            <BetDetailModal>
                <BetDetailBase
                    isTurnBase={false}
                    renderBetDetailResultBlock={(drawInfo) => <BetDetailResultBlock roundInfo={drawInfo} />}
                    produceDataBetDetailRow={produceDataBetDetailRow}
                    renderBetChoice={(choice) => <BetChoice choice={choice} />}
                />
            </BetDetailModal>
            <PFVerifyModal renderResultBlock={renderPFVerifyResultBlock}></PFVerifyModal>
            <PFClientSeedInfoModal fileNameExport={makeFileNameExport} />
            <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
        </>
    );
};

export default SeDieBetHistoryModal;


