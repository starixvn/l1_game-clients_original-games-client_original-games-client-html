import React from "react";
import { useSedieMultiplayerTranslate } from "../../../../_shared/react-hooks";

type Props = {
    openingGameId: number;
};

const HeaderTitle: React.FC<Props> = (props) => {
    const { openingGameId } = props;

    const { t: translate } = useSedieMultiplayerTranslate();

    const headerTitle = (
        <div className="text-animation text-primary-text transition-all duration-300 font-semibold text-base leading-[26px]">
            {translate(`game_name_${openingGameId}`)}
        </div>
    );

    return (
        <div key={`game-name-${openingGameId}`} id="img-game-name">
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
