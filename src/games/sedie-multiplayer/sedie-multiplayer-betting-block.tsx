import dynamic from "next/dynamic";
import { FC } from "react";

import SeDieMultiplayerBetOptionsComponent from "./bet-options/sedie-multiplayer-bet-options";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const SeDieMultiplayerBettingBlock: FC = () => {
    return (
        <div>
            <SeDieMultiplayerBetOptionsComponent />
            <WinningResultEffect />
        </div>
    );
};

export default SeDieMultiplayerBettingBlock;
