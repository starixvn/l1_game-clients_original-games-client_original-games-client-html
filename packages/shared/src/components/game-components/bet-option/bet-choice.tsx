import { memo } from "react";
import { getGlossaryTranslate } from '@shared/helpers';
import { useTranslator } from '@shared/react-hooks/use-translator';
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

export const BetChoice: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div id={`${tolgeeNamespace}-${choice}-bet-name`} className={`text-center ${Styles["bet-name"]} ${className}`}>
            {t(getGlossaryTranslate(tolgeeNamespace, choice)) || choice}
        </div>
    );
};

export default memo(BetChoice);
