import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../../components/game-base/type";
import { SeDieBetOptions, SeDieBetOptionsPercentageColor } from "../sedie-multiplayer-constants";
import Style from "./style.module.scss";
import { BetChoiceImagesData, DotColorMapper } from "../sedie-multiplayer-constants";
import { SedieMultiplayerSubBetOptions } from "./sedie-sub-option";
import { SedieMultiplayerMainOption } from "./sedie-main-option";
import useGameStore from "../../../_shared/stores/game-store/game-store";

// const BetChoice = dynamic(() => import("../../../components/game-components/bet-option/bet-choice"));
// const RippleButton = dynamic(() => import("../../../components/game-components/bet-option/ripple-button"));
// const BetPercentage = dynamic(() => import("../../../components/game-components/bet-option/bet-percentage"));
// const Odds = dynamic(() => import("../../../components/game-components/bet-option/odds"));
// const OwnBet = dynamic(() => import("../../../components/game-components/bet-option/own-bet"));
// const PlayerBetCount = dynamic(() => import("../../../components/game-components/bet-option/player-bet-count"));
// const TotalBet = dynamic(() => import("../../../components/game-components/bet-option/total-bet"));
// const SeDieWinningAnimation = dynamic(() => import("../sedie-multiplayer-winning-animation"));

const SeDieBetOptionsComponent = () => {
    const roundState = useGameStore((state) => state.roundState);

    const { tolgeeNamespace } = useGameContext();

    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const [loadingComplete, setLoadingComplete] = useState({
        [SeDieBetOptions.ODD]: false,
        [SeDieBetOptions.EVEN]: false,
        [SeDieBetOptions.RED2]: false,
        [SeDieBetOptions.RED3]: false,
        [SeDieBetOptions.RED4]: false,
        [SeDieBetOptions.WHITE3]: false,
        [SeDieBetOptions.WHITE4]: false,
    });



























    return (
        <>
            <SedieMultiplayerSubBetOptions tolgeeNamespace={tolgeeNamespace} />
            <div className="flex justify-between my-2">
                <SedieMultiplayerMainOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.EVEN} />
                <SedieMultiplayerMainOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.ODD} />

            </div>
        </>
    );
};

export default SeDieBetOptionsComponent;
