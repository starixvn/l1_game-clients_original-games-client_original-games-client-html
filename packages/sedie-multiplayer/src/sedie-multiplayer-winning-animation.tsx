import React from "react";
import { useMemoriedImage } from '@shared/react-hooks';
import { isHighLightWinningResult } from '@shared/react-hooks/use-high-light';
import { RoundState } from '@shared/components/game-base/type';
import { Spritesheet } from '@shared/components/game-components/sprites-sheet';
import { SeDieBetOptions } from "./sedie-multiplayer-constants";
import Styles from "./sedie-multiplayer.module.scss";

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

const SeDieMultiplayerWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;
    const [width, height] = ChoiceWinningSize[choice] || [146, 74];

    const imagePath = `/static/images/sedie-multiplayer/highlight-winning-${resourceName}.png`;
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

export default SeDieMultiplayerWinningAnimation;
