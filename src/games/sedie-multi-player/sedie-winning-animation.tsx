import React from "react";
import { useMemoriedImage } from "../../_shared/react-hooks";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import { SeDieBetOptions } from "./sedie-constants";
import Styles from "../se-ball/se-ball.module.scss";

type Props = {
    choice: string;
    resourceName: string;
    className?: string;
    roundState: RoundState;
    settlementResult: any;
    showResultInfo: any;
};

const ChoiceWinningSize = {
    [SeDieBetOptions.ODD]: [186, 104],
    [SeDieBetOptions.EVEN]: [186, 104],
    [SeDieBetOptions.RED2]: [146, 74],
    [SeDieBetOptions.RED3]: [146, 74],
    [SeDieBetOptions.RED4]: [146, 74],
    [SeDieBetOptions.WHITE3]: [146, 74],
    [SeDieBetOptions.WHITE4]: [146, 74],
};

const SeDieWinningAnimation: React.FC<Props> = ({
    choice,
    resourceName,
    roundState,
    settlementResult,
    showResultInfo
}) => {
    const winningHighLightResult = isHighLightWinningResult;
    const [width, height] = ChoiceWinningSize[choice] || [146, 74];

    // Use SeBall assets to keep UI consistent across games
    const imagePath = `/static/images/se-ball/highlight-winning-${resourceName}.png`;
    const { data } = useMemoriedImage(imagePath);

    if (!data) {
        return <></>;
    }

    return (
        winningHighLightResult({ betChoice: choice, roundState, settlementResult, showResultInfo }) && (
            <div className="d-grid">
                <Spritesheet
                    className={`${Styles["winning-light-anim"]} ${Styles["anim-" + choice]}`}
                    imageData={data}
                    widthFrame={width}
                    isResponsive
                    heightFrame={height}
                    steps={10}
                    autoplay={true}
                    loop={true}
                    fps={20}
                    startAt={0}
                    endAt={29}
                />

                <div className={`highlight-winning-bg-anim ${Styles["highlight-winning-bg-" + resourceName]}`}></div>
            </div>
        )
    );
};

export default SeDieWinningAnimation;
