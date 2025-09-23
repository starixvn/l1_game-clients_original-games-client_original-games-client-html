import { BeadBoardIconProps } from '@shared/components/game-components/statistic/types';
import { BaccaratBetOptions } from '../baccarat-multiplayer-constants';
import { getScoreboardImagePath } from './utils';
import Image from "next/image";

const PlayerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#538AFF] rounded-full -bottom-[0.6px] -right-[0.6px] z-[1]" />
);

const BankerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#FF2655] rounded-full -top-[0.6px] -left-[0.6px] z-[1]" />
);

type BeadBoardIconComponentProps = BeadBoardIconProps & {
    hasPlayerPair?: boolean;
    hasBankerPair?: boolean;
};

const BeadBoardIcon: React.FC<BeadBoardIconComponentProps> = ({ choice, hasPlayerPair = false, hasBankerPair = false }) => {
    if (!choice) {
        return null;
    }

    const getVariantFromChoice = (choice: string): "player" | "banker" | "tie" => {
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

    const variant = getVariantFromChoice(choice);

    return (
        <div className="relative w-[14px] h-[14px]">
            <Image
                src={getScoreboardImagePath(variant)}
                alt={variant}
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
