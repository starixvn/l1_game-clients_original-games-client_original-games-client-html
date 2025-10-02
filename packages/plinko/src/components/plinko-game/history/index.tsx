import BetDetailModal from "@shared/components/game-components/bet-history/bet-detail-modal";
import { FC } from "react";
import { BetDetailResultBlock, produceDataBetDetailRow } from "../../../../../shared/src/components/game-components/bet-history/plinko/plinko-bet-detail-result-block";
import PlinkoBetDetailBase from "../../../../../shared/src/components/game-components/bet-history/plinko/plinko-bet-detail-base";
import PFVerificationModal from "@shared/components/game-components/provably-fair/pf-verify/pf-verification-modal";
import PFClientSeedInfoModal from "@shared/components/game-components/provably-fair/pf-verify/pf-client-seed-info-modal";
import { PFVerifyModal } from "@shared/components/game-components/provably-fair";
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";

const PlinkoBetDetailModal: FC = () => {
    return (
        <>
            <BetDetailModal>
                <PlinkoBetDetailBase
                    isTurnBase={false}
                    renderBetDetailResultBlock={(drawInfo) => <BetDetailResultBlock roundInfo={drawInfo} />}
                    produceDataBetDetailRow={produceDataBetDetailRow}
                    isEnableProvablyFair={true}
                />
            </BetDetailModal>
            <PFVerifyModal renderResultBlock={renderPFVerifyResultBlock} isMergeClientSeed={false}></PFVerifyModal>
            <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
        </>
    );
};

export default PlinkoBetDetailModal;