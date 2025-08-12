import React, { useContext } from "react";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./error-message.module.scss";
import { ConnectFailedReasonKey } from "./type";
import { URLContext, updateURLContext } from "../../../_shared/react-contexts";

export const ConnectFailedMessage: React.FC<{
    tolgeeNamespace: string;
    id: number;
    onReconnect: () => void;
    reason: string;
    enableBackdrop: boolean;
}> = ({ tolgeeNamespace, id, onReconnect, reason, enableBackdrop }) => {
    console.log("[ConnectFailedMessage] rendering with:", { tolgeeNamespace, id, reason, enableBackdrop });
    const { t } = useTranslator([tolgeeNamespace]);
    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);

    const handleBackToLobby = () => {
        console.log("[ConnectFailedMessage] handleBackToLobby called");
        updateURLContext({ gameId: 0 });
        backToRedirectUrl(redirectUrl);
    };

    const handleBackToLobbyWithReload = () => {
        console.log("[ConnectFailedMessage] handleBackToLobbyWithReload called");
        updateURLContext({ backToLobby: true, gameId: 0 });
        redirectUrl ? backToRedirectUrl(redirectUrl) : window.location.reload();
    };

    const handleReconnect = () => {
        console.log("[ConnectFailedMessage] handleReconnect called");
        onReconnect();
    };

    const renderLostConnectionButtons = () => {
        console.log("[ConnectFailedMessage] rendering lost connection buttons");
        return (
            <div className="flex">
                <button onClick={handleBackToLobby} className={`btn-grey`}>
                    {t(`${ResourceTypes.COMMON}.back`)}
                </button>
                <button onClick={handleReconnect} className={`${Styles["btn-reconnect"]} btn-green`}>
                    {t(`${ResourceTypes.SABA_NUMBER}.button_reconnect`)}
                </button>
            </div>
        );
    };

    const renderButtons = () => {
        console.log("[ConnectFailedMessage] renderButtons called, reason:", reason);
        if (reason === ConnectFailedReasonKey.lostConnection) {
            return redirectUrl ? (
                renderLostConnectionButtons()
            ) : (
                <button onClick={handleReconnect} className={`btn-green w-100`}>
                    {t(`${ResourceTypes.SABA_NUMBER}.button_reconnect`)}
                </button>
            );
        }
        return redirectUrl ? (
            <button onClick={handleBackToLobbyWithReload} className={`btn-green w-100`}>
                {t(`${ResourceTypes.COMMON}.ok`)}
            </button>
        ) : null;
    };

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} enableBackdrop={enableBackdrop}>
            <div className={`modal-center yellow-color ${Styles["error-message-container"]}`}>
                <div className={`${Styles["warning-container"]}`}>
                    <div className={`icon-warning ${Styles["icon-warning"]}`}></div>
                </div>
                <div className={Styles["title"]}>{t(`${tolgeeNamespace}.game_name_${id}`)}</div>
                <div className={Styles["content"]}>
                    {t(reason, { gameName: tolgeeNamespace }).replaceTolgeeFormat().replace(tolgeeNamespace, "")}
                </div>
                <div className={Styles["list-action"]}>{renderButtons()}</div>
            </div>
        </BaseDialog>
    );
};
