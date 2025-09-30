import { BeadBoardIconProps } from "@shared/components/game-components/statistic/types";
import { BaccaratBetOptions, BaccaratWinner, Winner } from "../baccarat-multiplayer-constants";
import { getScoreboardImagePath, getDisplayTextKey } from "./utils";
import Image from "next/image";
import { ResourceTypes } from "@shared/resources";
import { useTranslator } from "@shared/react-hooks/use-translator";

const Dot = ({ color, position }: { color: string; position: string }) => (
    <div className={`absolute w-[5px] h-[5px] rounded-full z-[1] ${color} ${position}`} />
);

const PlayerPairDot = () => <Dot color="bg-[#538AFF]" position="bottom-0 right-0" />;

const BankerPairDot = () => <Dot color="bg-[#FF2655]" position="top-0 left-0" />;

const getVariantFromChoice = (choice: string): BaccaratWinner => {
    switch (choice.toLowerCase()) {
        case BaccaratBetOptions.PLAYER:
            return Winner.PLAYER;
        case BaccaratBetOptions.BANKER:
            return Winner.BANKER;
        case BaccaratBetOptions.TIE:
            return Winner.TIE;
        default:
            return Winner.PLAYER;
    }
};

type BeadBoardIconComponentProps = BeadBoardIconProps & {
    hasPlayerPair?: boolean;
    hasBankerPair?: boolean;
};

const BeadBoardIcon: React.FC<BeadBoardIconComponentProps> = ({ choice, hasPlayerPair = false, hasBankerPair = false }) => {
    const { t } = useTranslator([ResourceTypes.BACCARAT_MULTIPLAYER]);

    if (!choice) {
        return null;
    }

    const variant = getVariantFromChoice(choice);
    const label = t(getDisplayTextKey(variant));

    return (
        <div className="relative w-[14px] h-[14px] flex items-center justify-center">
            <Image src={getScoreboardImagePath(variant)} alt={variant} width={14} height={14} className="w-[14px] h-[14px]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] text-white text-center text-[9px] font-semibold flex items-center justify-center h-full w-full">
                {label}
            </span>

            {hasPlayerPair && <PlayerPairDot />}
            {hasBankerPair && <BankerPairDot />}
        </div>
    );
};

export default BeadBoardIcon;
