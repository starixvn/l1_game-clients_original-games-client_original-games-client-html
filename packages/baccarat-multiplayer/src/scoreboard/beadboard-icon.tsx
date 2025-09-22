import { BeadBoardIconProps } from '@shared/components/game-components/statistic/types';
import { BaccaratBetOptions } from '../baccarat-multiplayer-constants';
import Image from "next/image";

type BeadBoardIconComponentProps = BeadBoardIconProps & {
    hasPlayerPair?: boolean;
    hasBankerPair?: boolean;
};

const PlayerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#538AFF] rounded-full -bottom-[0.6px] -right-[0.6px] z-[1]" />
);

const BankerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#FF2655] rounded-full -top-[0.6px] -left-[0.6px] z-[1]" />
);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";


const BeadBoardIcon: React.FC<BeadBoardIconComponentProps> = ({ choice, hasPlayerPair = false, hasBankerPair = false }) => {
    if (!choice) {
        return null;
    }

    const getImagePath = (choice: string) => {
        switch (choice.toLowerCase()) {
            case BaccaratBetOptions.PLAYER:
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/player.svg`;
            case BaccaratBetOptions.BANKER:
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/banker.svg`;
            case BaccaratBetOptions.TIE:
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/tie.svg`;
            default:
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/player.svg`;
        }
    };

    const getAltText = (choice: string) => {
        switch (choice.toLowerCase()) {
            case BaccaratBetOptions.PLAYER:
                return "player";
            case BaccaratBetOptions.BANKER:
                return "banker";
            case BaccaratBetOptions.TIE:
                return "tie";
            default:
                return "player";
        }
    };

    return (
        <div className="relative w-[14px] h-[14px]">
            <Image
                src={getImagePath(choice)}
                alt={getAltText(choice)}
                width={14}
                height={14}
                className="w-[14px] h-[14px]"
            />
            {hasPlayerPair && <PlayerPairDot />}
            {hasBankerPair && <BankerPairDot />}
        </div>
    );
};

export default BeadBoardIcon;
