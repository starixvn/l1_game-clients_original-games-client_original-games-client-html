import React from "react";
import { useTranslator } from "../../../../_shared/react-hooks";

type Props = {
    openingGameId: number;
    tolgeeNamespace: string;
};

const HeaderTitle: React.FC<Props> = (props) => {
    const { openingGameId, tolgeeNamespace } = props;

    const { t: translate } = useTranslator([tolgeeNamespace]);

    const headerTitle = (
        <div className="text-animation text-primary-text transition-all duration-300 font-semibold text-base leading-[26px]">
            {openingGameId > 0 && translate(`${tolgeeNamespace}.game_name_${openingGameId}`)}
        </div>
    );

    return (
        <div key={`game-name-${openingGameId}`} id="img-game-name">
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
