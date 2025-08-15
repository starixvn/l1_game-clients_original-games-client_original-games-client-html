import { useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { RoundState } from "../../../components/game-base/type";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import Style from "./style.module.scss";
import { SedieMultiplayerSubBetOptions } from "./sedie-sub-option";
import { SedieMultiplayerMainOption } from "./sedie-main-option";
import useGameStore from "../../../_shared/stores/game-store/game-store";

const SeDieBetOptionsComponent = () => {
    const roundState = useGameStore((state) => state.roundState);
    const { tolgeeNamespace } = useGameContext();

    const [loadingComplete] = useState({
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
