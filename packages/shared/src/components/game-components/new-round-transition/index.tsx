import { FC, useEffect, useState } from "react";

import { useGameStateContext } from '@shared/merged/_shared/react-contexts/game-state-context/game-state-context';
import { RoundState } from "../../game-base/type";
import Styles from "./new-round-transition.module.scss";

export const NewRoundTransitionWithoutExtraSeconds = () => {
    const { roundState } = useGameStateContext();

    if ([RoundState.SwitchRound, RoundState.BeforePlaceBet].includes(roundState)) {
        return <NewRoundTransition isExtraOneSecond={false} />;
    }

    return <></>;
};

export const NewRoundTransitionWithinExtraSeconds = () => {
    const { prevRoundState, roundState } = useGameStateContext();

    if ((prevRoundState === RoundState.SwitchRound && roundState === RoundState.BeforePlaceBet) || roundState === RoundState.SwitchRound) {
        return <NewRoundTransition isExtraOneSecond={true} />;
    }

    return <></>;
};

const NewRoundTransition: FC<{ isExtraOneSecond: boolean }> = ({ isExtraOneSecond = false }) => {
    const [hideAnim, setHideAnim] = useState(false);

    const hideAnimDelayTime = 3300;
    const hideAnimExtraOneSecondDelayTime = 3900;

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (!hideAnim) {
            timeOut = setTimeout(
                () => {
                    setHideAnim(true);
                },
                isExtraOneSecond ? hideAnimExtraOneSecondDelayTime : hideAnimDelayTime
            );
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, []);

    return (
        <div
            className={`${Styles["new-round-transition"]} ${hideAnim ? Styles["hide"] : ""} ${
                isExtraOneSecond ? Styles["extra-one-second"] : ""
            }`}
        >
            <div className={Styles["transition-layer"]}>
                <div className={Styles["light"]}></div>
            </div>
        </div>
    );
};
