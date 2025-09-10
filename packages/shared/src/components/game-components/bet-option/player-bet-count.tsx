import isEmpty from "lodash/isEmpty";

import { RoundState } from "../../game-base/type";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/react/shallow";

export const PlayerBetCount: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const { playerBetCount, roundState } = useGameStore(
        useShallow((state) => ({ playerBetCount: state.playerBetCount, roundState: state.roundState }))
    );

    if (isEmpty(playerBetCount) || !playerBetCount[choice] || [RoundState.SwitchRound, RoundState.BeforePlaceBet].includes(roundState)) {
        return <></>;
    }

    return (
        <div className={`${className} ${Styles["player-count"]} `}>
            <span className="icon-user"></span>
            <span className={Styles["player-count-value"]} id={`${tolgeeNamespace}-${choice}-no`}>
                {playerBetCount[choice]}
            </span>
        </div>
    );
};

export default PlayerBetCount;
