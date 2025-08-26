import React from "react";
import { useSedieMultiplayerTranslate } from "../../../../_shared/react-hooks";

type Props = {
    openingGameId: number;
};

const HeaderTitle: React.FC<Props> = (props) => {
    const { openingGameId } = props;

    const { t: translate } = useSedieMultiplayerTranslate();

    console.log("openingGameId", openingGameId);
    console.log(translate(`game_name_${openingGameId}`));
    
    

    const headerTitle = (
        <div className="text-animation text-primary-text transition-all duration-300">
            {translate(`game_name_${openingGameId}`).toUpperCase()}
        </div>
    );

    return (
        <div key={`game-name-${openingGameId}`} id="img-game-name">
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
