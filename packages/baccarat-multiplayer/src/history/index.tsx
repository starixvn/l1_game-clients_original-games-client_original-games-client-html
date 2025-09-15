import { FC } from "react";

import BetDetailBase from "@shared/components/game-components/bet-history/bet-detail-base";
import BetDetailModal from "@shared/components/game-components/bet-history/bet-detail-modal";
import { BetChoice, BetDetailResultBlock, produceDataBetDetailRow } from "./baccarat-multiplayer-bet-detail-result-block";

const BaccaratMultiplayerBetDetailModal: FC = () => {
    return (
        <>
            <BetDetailModal>
                <BetDetailBase
                    isTurnBase={false}
                    renderBetDetailResultBlock={(drawInfo) => <BetDetailResultBlock roundInfo={drawInfo} />}
                    produceDataBetDetailRow={produceDataBetDetailRow}
                    renderBetChoice={(choice) => <BetChoice choice={choice} />}
                    isEnableProvablyFair={false}
                />
            </BetDetailModal>
        </>
    );
};

export default BaccaratMultiplayerBetDetailModal;
