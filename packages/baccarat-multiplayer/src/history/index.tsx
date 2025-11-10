import { FC } from "react";

import BetDetailContent from "@shared/components/game-components/bet-history/bet-detail-content";
import BetDetailModal from "@shared/components/game-components/bet-history/bet-detail-modal";
import BaccaratMultiplayerBetDetailResultBlock from "./baccarat-multiplayer-bet-detail-result-block";
import BetDetailTable from "@shared/components/game-components/bet-history/bet-detail-table";
import BaccaratMultiplayerBetDetailBodyItem from "./baccarat-multiplayer-bet-detail-body-item";

const BaccaratMultiplayerBetDetailModal: FC = () => {
    return (
        <>
            <BetDetailModal>
                <BetDetailContent
                    isEnableProvablyFair={false}
                    ResultBlock={<BaccaratMultiplayerBetDetailResultBlock />}
                    Table={<BetDetailTable BodyItem={BaccaratMultiplayerBetDetailBodyItem} />}
                />
            </BetDetailModal>
        </>
    );
};

export default BaccaratMultiplayerBetDetailModal;
