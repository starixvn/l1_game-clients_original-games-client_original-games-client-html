import React, { useContext } from "react";
import { URLContext } from "../../../_shared/react-contexts";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import Styles from "./button-back.module.scss";

const ButtonReturnToURL: React.FC = () => {
    const { t } = useCommonTranslate();

    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);
    const handleBackToReturnURL = () => {
        backToRedirectUrl(redirectUrl);
    };

    return redirectUrl ? (
        <button id="btn-back" className={Styles["btn-back"]} onClick={() => handleBackToReturnURL()}>
            {t(`back`)}
        </button>
    ) : (
        <></>
    );
};

export default ButtonReturnToURL;
