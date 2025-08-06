import React, { useContext } from "react";
import { buildVersion } from "../../../_shared/constants";
import { URLContext } from "../../../_shared/react-contexts";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./disabled-modal.module.scss";

const DisabledModal: React.FC<{ disableMessage: string }> = ({ disableMessage }) => {
    const { t } = useCommonTranslate();
    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);
    const showOkButton = !!redirectUrl;

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} enableBackdrop={true}>
            <div className={`modal-center yellow-color ${Styles["disable-message-container"]}`}>
                <div className={`${Styles["um-setting-icon"]}`}>
                    <img
                        className={`${Styles["um-setting-big"]}`}
                        src={`/static/images/um-setting-big.svg?v=${buildVersion}`}
                        alt="setting-um"
                    />
                    <img
                        className={`${Styles["um-setting-small"]}`}
                        src={`/static/images/um-setting-small.svg?v=${buildVersion}`}
                        alt="setting-um"
                    />
                </div>
                <div className={Styles.message}>{disableMessage || t({ key: "message_disabled_game" })}</div>
                <div className={Styles["list-action"]}>
                    {showOkButton && (
                        <button onClick={() => backToRedirectUrl(redirectUrl)} className={`btn-yellow ${Styles["ok"]}`}>
                            {t({ key: "ok" })}
                        </button>
                    )}
                </div>
            </div>
        </BaseDialog>
    );
};

export default DisabledModal;
