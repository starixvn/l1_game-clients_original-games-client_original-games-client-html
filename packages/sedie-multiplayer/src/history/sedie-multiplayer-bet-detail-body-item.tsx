import { FC, memo } from "react";
import Image from "next/image";
import BetDetailTableBodyItem from "@shared/components/game-components/bet-history/bet-detail-table-body-item";
import { useGameContext } from "@shared/react-contexts/game-context/game-context";
import { useTranslator } from "@shared/react-hooks";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const IMAGE_SIZE = 30;

const BetChoice: FC<{ choice: string }> = ({ choice }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);

    const isOddOrEven = choice === SeDieBetOptions.ODD || choice === SeDieBetOptions.EVEN;

    return (
        <span className="font-text flex justify-center items-center font-semibold">
            {isOddOrEven ? (
                t(`glossary_${choice}`)
            ) : (
                <Image
                    src={`${basePath}/static/images/sedie-multiplayer/bet-detail/bet-detail-${choice}.svg`}
                    alt={`${choice} choice`}
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                />
            )}
        </span>
    );
};

const SedieMultiplayerBetDetailBodyItem = ({ data }: { data: any }) => {
    return <BetDetailTableBodyItem BetChoice={BetChoice} data={data} />;
};

export default memo(SedieMultiplayerBetDetailBodyItem);
