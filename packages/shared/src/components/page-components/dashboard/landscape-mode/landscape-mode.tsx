import { buildVersion } from "../../../../_shared/constants";
import { useCommonTranslate } from "../../../../_shared/react-hooks";
import Styles from "./landscape-mode.module.scss";

export const LandscapeMode = () => {
    const { t } = useCommonTranslate();
    return (
        <div className={Styles["landscape-mode"]} data-testid="landscape-mode-component">
            <img src={`/static/images/icons/landscape-icon.svg?v=${buildVersion}`} alt="landscape-icon" />
            <p className={Styles["info"]}>{t("message_rotate_device")}</p>
        </div>
    );
};

export default LandscapeMode;
