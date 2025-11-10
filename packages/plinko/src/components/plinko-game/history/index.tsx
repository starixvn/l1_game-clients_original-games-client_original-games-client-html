import { FC } from "react";
import PlinkoBetDetailContent from "./plinko-bet-detail-content";
import PFVerificationModal from "@shared/components/game-components/provably-fair/pf-verify/pf-verification-modal";
import PFVerifyModal from "@shared/components/game-components/provably-fair/pf-verify";
import { PFVerification, renderPFVerifyResultBlock } from "../provably-fair";
import PlinkoBetDetailModal from "./plinko-bet-detail-modal";

const PlinkoBetDetail: FC = () => {
    return (
        <>
            <PlinkoBetDetailModal>
                <PlinkoBetDetailContent />
            </PlinkoBetDetailModal>
            <PFVerifyModal ResultBlock={renderPFVerifyResultBlock} isMergeClientSeed={false}></PFVerifyModal>
            <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
        </>
    );
};

export default PlinkoBetDetail;
