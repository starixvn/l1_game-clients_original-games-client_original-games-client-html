import { FC } from "react";
import {
    BetDetailResultBlock,
    produceDataBetDetailRow,
} from "./plinko-bet-detail-result-block";
import PlinkoBetDetailBase from "./plinko-bet-detail-base";
import PFVerificationModal from "@shared/components/game-components/provably-fair/pf-verify/pf-verification-modal";
import { PFVerifyModal } from "@shared/components/game-components/provably-fair";
import { PFVerification, renderPFVerifyResultBlock } from "../provably-fair";
import PlinkoBetDetailModal from "./plinko-bet-detail-modal";

const PlinkoBetDetail: FC = () => {
    return (
        <>
            <PlinkoBetDetailModal>
                <PlinkoBetDetailBase
                    isTurnBase={false}
                    renderBetDetailResultBlock={(drawInfo) => <BetDetailResultBlock roundInfo={drawInfo} />}
                    produceDataBetDetailRow={produceDataBetDetailRow}
                    isEnableProvablyFair={true}
                />
            </PlinkoBetDetailModal>
            <PFVerifyModal renderResultBlock={renderPFVerifyResultBlock} isMergeClientSeed={false}></PFVerifyModal>
            <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
        </>
    );
};

export default PlinkoBetDetail;
