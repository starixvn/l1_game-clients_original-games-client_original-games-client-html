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

const GamesNotPlayStarsAnimation: number[] = [];

const StarField: FC<{ gameId: number }> = ({ gameId }) => {
    const isLowPerformanceDevice = useLowPerformanceDevice();

    const isShouldNotPlayStarsAnimation = () => {
        // GamesNotPlayStarsAnimation is always empty, so this will always be false.
        // We can simplify to just check isLowPerformanceDevice.
        return isLowPerformanceDevice;
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
    // Map non-existing backgrounds to closest existing ones in assets
    const backgroundKeyMapper: Record<string, string> = {
        sedie: "seball1",
    };

    const gameKey = (gameName || "").toLowerCase();
    const mappedKey = backgroundKeyMapper[gameKey] || gameKey;
    const imageUrls = `/static/images/bg-galaxy/bg-${mappedKey}.webp?v=${buildVersion}`;

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
