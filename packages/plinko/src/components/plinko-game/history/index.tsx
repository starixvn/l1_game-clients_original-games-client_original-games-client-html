import BetDetailModal from "@shared/components/game-components/bet-history/bet-detail-modal";
import { FC } from "react";
import { BetDetailResultBlock, produceDataBetDetailRow } from "../../../../../shared/src/components/game-components/bet-history/plinko/plinko-bet-detail-result-block";
import PlinkoBetDetailBase from "../../../../../shared/src/components/game-components/bet-history/plinko/plinko-bet-detail-base";


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
        </>
    );
};

export default PlinkoBetDetailModal;