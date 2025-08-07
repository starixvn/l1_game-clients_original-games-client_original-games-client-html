import Image from "next/image";
import { FC, memo } from "react";

import { buildVersion, GameIds } from "../../../_shared/constants";
import { useLowPerformanceDevice } from "../../../_shared/react-hooks";

type Props = {
    gameId: number;
};

const getGameName = (gameId) => {
    for (const gameName in GameIds) {
        if (GameIds[gameName] === gameId) {
            return gameName;
        }
    }
    return null;
};

const GamesNotPlayStarsAnimation = [GameIds.SicBall];

const StarField: FC<{ gameId: number }> = ({ gameId }) => {
    const isLowPerformanceDevice = useLowPerformanceDevice();

    const isShouldNotPlayStarsAnimation = () => {
        return !!GamesNotPlayStarsAnimation.find((id) => id === gameId) && isLowPerformanceDevice;
    };

    if (isShouldNotPlayStarsAnimation()) {
        return <></>;
    }

    return (
        <div className="star-field">
            <div className="layer"></div>
            <div className="layer"></div>
            <div className="layer"></div>
        </div>
    );
};

export const BackgroundGalaxy: React.FC<Props> = ({ gameId }) => {
    const gameName = getGameName(gameId);
    const imageUrls = `/static/images/bg-galaxy/bg-${gameName.toLowerCase()}.webp?v=${buildVersion}`;

    return (
        <>
            <div className="background-galaxy">
                <Image className="galaxy-2" width={580} height={850} src={imageUrls} alt="galaxy" />

                <div className="galaxy-1-container">
                    <Image className="galaxy-1" width={580} height={850} src={imageUrls} alt="galaxy" />
                </div>
            </div>
            <StarField gameId={gameId} />
        </>
    );
};

export default memo(BackgroundGalaxy);
