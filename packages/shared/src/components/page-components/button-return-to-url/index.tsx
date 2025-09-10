import React, { useContext } from "react";
import { URLContext } from "../../../_shared/react-contexts";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import Styles from "./button-back.module.scss";

const ButtonReturnToURL: React.FC = () => {
    console.log("[ButtonReturnToURL] ButtonReturnToURL component rendering");
    const { t } = useCommonTranslate();

    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);

    console.log("[ButtonReturnToURL] redirectUrl:", redirectUrl);

    const handleBackToReturnURL = () => {
        console.log("[ButtonReturnToURL] handleBackToReturnURL called");
        backToRedirectUrl(redirectUrl);
    };

    if (!redirectUrl) {
        console.log("[ButtonReturnToURL] no redirectUrl, not rendering button");
        return <></>;
    }

    console.log("[ButtonReturnToURL] rendering button");
    return (
        <button id="btn-back" className={Styles["btn-back"]} onClick={() => handleBackToReturnURL()}>
            {t(`back`)}
        </button>
    );
};

export default ButtonReturnToURL;
