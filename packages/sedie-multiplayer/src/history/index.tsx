import { FC } from "react";

import BetDetailModal from "@shared/components/game-components/bet-history/bet-detail-modal";
import PFVerifyModal from "@shared/components/game-components/provably-fair/pf-verify";
import PFClientSeedInfoModal from "@shared/components/game-components/provably-fair/pf-verify/pf-client-seed-info-modal";
import PFVerificationModal from "@shared/components/game-components/provably-fair/pf-verify/pf-verification-modal";
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";
import { BetDetailResultBlock } from "./sedie-multiplayer-bet-detail-result-block";
import BetDetailContent from "@shared/components/game-components/bet-history/bet-detail-content";
import SedieMultiplayerBetDetailBodyItem from "./sedie-multiplayer-bet-detail-body-item";
import BetDetailTable from "@shared/components/game-components/bet-history/bet-detail-table";

const SeDieMultiplayerBetDetailModal: FC = () => {
    return (
        <>
            <BetDetailModal>
                <BetDetailContent
                    ResultBlock={<BetDetailResultBlock />}
                    Table={<BetDetailTable BodyItem={SedieMultiplayerBetDetailBodyItem} />}
                />
            </BetDetailModal>
            <PFVerifyModal ResultBlock={renderPFVerifyResultBlock}></PFVerifyModal>
            <PFClientSeedInfoModal fileNameExport={makeFileNameExport} renderResultBlock={renderPFVerifyResultBlock} />
            <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
        </>
    );
};

export default SeDieMultiplayerBetDetailModal;
