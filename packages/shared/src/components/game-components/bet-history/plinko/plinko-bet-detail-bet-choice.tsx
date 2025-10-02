import { FC } from "react";
import { BaseProps } from "../../bet-option/types";
import { useTranslator } from "@shared/react-hooks/use-translator";
import { useGameContext } from "@shared/react-contexts/game-context/game-context";


const PlinkoBetDetailBetChoice: React.FC<BaseProps> = ({ choice }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);
    return <span className="font-text flex justify-center items-center">{t(`glossary_${choice.toLowerCase()}`)}</span>;
};

export default PlinkoBetDetailBetChoice;