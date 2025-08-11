import dynamic from "next/dynamic";
import { FC } from "react";

import BettingBlock from "../../components/game-components/bet-option/betting-block";
import SeDieBetOptionsComponent from "./sedie-bet-options-component";
import Style from "./sedie-multi-player.module.scss";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const SeDieBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <SeDieBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};

export default SeDieBettingBlock;
