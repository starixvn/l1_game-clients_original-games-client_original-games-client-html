import { FC } from "react";

import BetDetailBase from '@shared/components/game-components/bet-history/bet-detail-base';
import BetDetailModal from '@shared/components/game-components/bet-history/bet-detail-modal';
import { PFVerifyModal } from '@shared/components/game-components/provably-fair';
import PFClientSeedInfoModal from '@shared/components/game-components/provably-fair/pf-verify/pf-client-seed-info-modal';
import PFVerificationModal from '@shared/components/game-components/provably-fair/pf-verify/pf-verification-modal';
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";
import { BetChoice, BetDetailResultBlock, produceDataBetDetailRow } from "./sedie-multiplayer-bet-detail-result-block";

const SeDieMultiplayerBetDetailModal: FC = () => {
    return (
        <>
            <BetDetailModal>
                <BetDetailBase
                    isTurnBase={false}
                    renderBetDetailResultBlock={(drawInfo) => <BetDetailResultBlock roundInfo={drawInfo} />}
                    produceDataBetDetailRow={produceDataBetDetailRow}
                    renderBetChoice={(choice) => <BetChoice choice={choice} />}
                />
            </BetDetailModal>
            <PFVerifyModal renderResultBlock={renderPFVerifyResultBlock}></PFVerifyModal>
            <PFClientSeedInfoModal fileNameExport={makeFileNameExport} renderResultBlock={renderPFVerifyResultBlock} />
            <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
        </>
    );
};

export default SeDieMultiplayerBetDetailModal;
