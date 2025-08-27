// useState import removed as it's not used

import { useGameContext } from "../../../_shared/react-contexts";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import { SedieMultiplayerSubBetOptions } from "./sedie-sub-option";
import { SedieMultiplayerMainOption } from "./sedie-main-option";

const SeDieMultiplayerBetOptions = () => {
    const { tolgeeNamespace } = useGameContext();

    return (
        <>
            <SedieMultiplayerSubBetOptions tolgeeNamespace={tolgeeNamespace} />
            <div className="flex justify-between my-2 md:mb-6">
                <SedieMultiplayerMainOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.EVEN} />
                <SedieMultiplayerMainOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.ODD} />
            </div>
        </>
    );
};

export default SeDieMultiplayerBetOptions;
