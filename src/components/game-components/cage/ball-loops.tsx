import { useMemo } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useLowPerformanceDevice, useMemoriedImage } from "../../../_shared/react-hooks";
import { RoundState } from "../../game-base/type";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";
const VALID_RENDER_STATES = [RoundState.InRound, RoundState.LockingBet, RoundState.DisplayResult];

const BallAnimation: React.FC = () => {
    const isLowPerformanceDevice = useLowPerformanceDevice();
    const { data } = useMemoriedImage(`/static/images/cage/cage-loop-anim.webp`);

    if (!data) {
        return <></>;
    }

    return (
        <Spritesheet
            className={`fade-in ${Styles["balls-loop"]}`}
            imageData={data}
            widthFrame={130}
            heightFrame={130}
            isResponsive
            steps={11}
            autoplay
            loop
            fps={isLowPerformanceDevice ? 30 : 40}
        />
    );
};

const BallLoops: React.FC = () => {
    const { roundState } = useGameStateContext();
    const shouldRenderBalls = VALID_RENDER_STATES.includes(roundState);
    return useMemo(() => {
        return (
            <div id="cage-balls" className={Styles["cage-balls"]}>
                {shouldRenderBalls ? <BallAnimation /> : <div className={Styles["idle-balls"]} />}
            </div>
        );
    }, [shouldRenderBalls]);
};

export default BallLoops;
