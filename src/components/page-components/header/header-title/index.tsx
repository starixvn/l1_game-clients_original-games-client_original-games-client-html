import Image from "next/image";
import React from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { useURLContext } from "../../../../_shared/react-contexts";
import { useTranslator } from "../../../../_shared/react-hooks";
import { ResourceTypes } from "../../../../_shared/resources";
import Styles from "./header-title.module.scss";

type Props = {
    isRenderGames: boolean;
    openingGameId: number;
};

const HeaderTitle: React.FC<Props> = (props) => {
    console.log("[HeaderTitle] HeaderTitle component rendering with props:", props);
    const { gameSettings } = getAppSettings();
    const { openingGameId, isRenderGames } = props;
    const appSetting = gameSettings[openingGameId];
    const tolgeeNamespace = appSetting ? appSetting["tolgeeNamespace"] : ResourceTypes.SABA_NUMBER;
    const { redirectUrl, backToRedirectUrl } = useURLContext();

    console.log("[HeaderTitle] context:", { openingGameId, isRenderGames, tolgeeNamespace, redirectUrl: !!redirectUrl });

    const { t } = useTranslator([tolgeeNamespace]);

    const handleClickLogo = () => {
        console.log("[HeaderTitle] handleClickLogo called");
        if (backToRedirectUrl && redirectUrl) {
            backToRedirectUrl(redirectUrl);
        }
    };

    const logo = (
        <Image src={`/static/images/logo-site.svg`} height={26} width={110} className="logo" alt="Logo" />
    );

    const headerTitle = isRenderGames ? (
        <div className="text-animation">{t(`${tolgeeNamespace}.game_name_${openingGameId}`).toUpperCase()}</div>
    ) : (
        logo
    );

    console.log("[HeaderTitle] rendering headerTitle:", isRenderGames ? "game name" : "logo");

    return (
        <div key={`game-name-${openingGameId}`} id="img-game-name" className={Styles["header-left"]}>
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
