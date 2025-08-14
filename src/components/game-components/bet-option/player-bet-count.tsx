import isEmpty from "lodash/isEmpty";

import { RoundState } from "../../game-base/type";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export const PlayerBetCount: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const playerBetCount = useGameStore((state) => state.playerBetCount);
    const roundState = useGameStore((state) => state.roundState);

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
