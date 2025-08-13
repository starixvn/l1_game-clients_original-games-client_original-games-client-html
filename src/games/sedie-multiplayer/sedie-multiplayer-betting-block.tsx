import dynamic from "next/dynamic";
import { FC } from "react";

import BettingBlock from "../../components/game-components/bet-option/betting-block";
import SeDieBetOptionsComponent from "./bet-options/sedie-multiplayer-bet-options-component";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const SeDieBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div>
                <SeDieBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};

export default SeDieBettingBlock;
