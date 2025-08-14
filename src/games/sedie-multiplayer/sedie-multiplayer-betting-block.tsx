import dynamic from "next/dynamic";
import { FC } from "react";

import SeDieBetOptionsComponent from "./bet-options/sedie-multiplayer-bet-options-component";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const SeDieBettingBlock: FC = () => {
    return (
        <div>
            <SeDieBetOptionsComponent />
            <WinningResultEffect />
        </div>
    );
};

export default SeDieBettingBlock;
