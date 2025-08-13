import React from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { useTranslator } from "../../../../_shared/react-hooks";
import { ResourceTypes } from "../../../../_shared/resources";

type Props = {
    openingGameId: number;
};

const HeaderTitle: React.FC<Props> = (props) => {
    const { gameSettings } = getAppSettings();
    const { openingGameId } = props;
    const appSetting = gameSettings[openingGameId];
    const tolgeeNamespace = appSetting ? appSetting["tolgeeNamespace"] : ResourceTypes.SABA_NUMBER;

    const { t } = useTranslator([tolgeeNamespace]);

    const headerTitle = (
        <div className="text-animation text-primary-text transition-all duration-300">
            {t(`${tolgeeNamespace}.game_name_${openingGameId}`).toUpperCase()}
        </div>
    );

    return (
        <div key={`game-name-${openingGameId}`} id="img-game-name">
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
