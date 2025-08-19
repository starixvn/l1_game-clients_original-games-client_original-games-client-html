import dynamic from "next/dynamic";
import { FC } from "react";

import SeDieMultiplayerBetOptions from "./bet-options/sedie-multiplayer-bet-options";

const BalanceEffect = dynamic(() => import("../../components/game-components/balance-effect"));

const SeDieMultiplayerBettingBlock: FC = () => {
    return (
        <div className="relative">
            <SeDieMultiplayerBetOptions />
            <BalanceEffect />
        </div>
    );
};

export default SeDieMultiplayerBettingBlock;
