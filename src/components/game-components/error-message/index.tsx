import React, { useContext } from "react";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { ConnectFailedReasonKey } from "./type";
import { URLContext, updateURLContext } from "../../../_shared/react-contexts";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import PopupButton from "../popup-button";

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
        backToRedirectUrl?.(redirectUrl);
    };

    const handleBackToLobbyWithReload = () => {
        console.log("[ConnectFailedMessage] handleBackToLobbyWithReload called");
        updateURLContext({ backToLobby: true, gameId: 0 });
        redirectUrl ? backToRedirectUrl?.(redirectUrl) : window.location.reload();
    };

    const handleReconnect = () => {
        console.log("[ConnectFailedMessage] handleReconnect called");
        onReconnect();
    };

    const renderLostConnectionButtons = () => {
        console.log("[ConnectFailedMessage] rendering lost connection buttons");
        return (
            <div className="flex justify-between">
                <PopupButton
                    onClick={handleBackToLobby}
                    className="bg-btn-gray hover:enabled:bg-btn-green-hover-bg"
                    label={t(`${ResourceTypes.COMMON}.back`)}
                />
                <PopupButton
                    onClick={handleReconnect}
                    className="bg-btn-green hover:enabled:bg-btn-green-hover-bg"
                    label={t(`${ResourceTypes.SABA_NUMBER}.button_reconnect`)}
                />
            </div>
        );
    };

    const renderButtons = () => {
        console.log("[ConnectFailedMessage] renderButtons called, reason:", reason);
        if (reason === ConnectFailedReasonKey.lostConnection) {
            return redirectUrl ? (
                renderLostConnectionButtons()
            ) : (
                <PopupButton
                    onClick={handleReconnect}
                    className="bg-btn-green hover:enabled:bg-btn-green-hover-bg"
                    label={t(`${ResourceTypes.SABA_NUMBER}.button_reconnect`)}
                />
            );
        }
        return redirectUrl ? (
            <button onClick={handleBackToLobbyWithReload} className="btn-green w-100">
                {t(`${ResourceTypes.COMMON}.ok`)}
            </button>
        ) : null;
    };

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} enableBackdrop={enableBackdrop}>
            <div
                className={cn(
                    "absolute text-center py-4 px-3 rounded-2xl text-sm left-1/2 transform -translate-x-1/2 min-w-[343px] font-normal",
                    "bottom-1/2 translate-y-1/2 z-modal overflow-hidden",
                    "bg-modal-gradient border border-modal-border-color shadow-modal",
                    "before:content-[''] before:block before:absolute before:-top-[100px] before:-left-[100px] before:w-[240px] before:h-[240px] before:rounded-[240px] before:opacity-70",
                    "p-5"
                )}
            >
                <div className="w-[50px] h-[50px] bg-black/30 rounded-full flex justify-center items-center mx-auto mb-[10px]">
                    <div className="text-[25px] text-[#ffd21e] before:content-['⚠']"></div>
                </div>
                <div className="text-base leading-[22px] font-semibold mb-[15px]">{t(`${tolgeeNamespace}.game_name_${id}`)}</div>
                <div className="text-sm font-normal">
                    {t(reason, { gameName: tolgeeNamespace }).replaceTolgeeFormat().replace(tolgeeNamespace, "")}
                </div>
                <div className="mt-4">{renderButtons()}</div>
            </div>
        </BaseDialog>
    );
};
