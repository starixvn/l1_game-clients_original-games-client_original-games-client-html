import { buildVersion } from '@shared/constants';
import { useCommonTranslate } from '@shared/react-hooks';
import Styles from "./landscape-mode.module.scss";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const LandscapeMode = () => {
    const { t } = useCommonTranslate();
    return (
        <div className={Styles["landscape-mode"]} data-testid="landscape-mode-component">
            <img src={`${basePath}/static/images/icons/landscape-icon.svg?v=${buildVersion}`} alt="landscape-icon" />
            <p className={Styles["info"]}>{t("message_rotate_device")}</p>
        </div>
    );
};

export default LandscapeMode;
