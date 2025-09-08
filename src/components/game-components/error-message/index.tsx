import React, { useContext } from "react";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { ConnectFailedReasonKey } from "./type";
import { URLContext, updateURLContext } from "../../../_shared/react-contexts";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import PopupButton from "../popup-button";
import Image from "next/image";
import { useClickSound } from "../../../_shared/react-hooks";

export const ConnectFailedMessage: React.FC<{
    tolgeeNamespace: string;
    id: number;
    onReconnect: () => void;
    reason: string;
    enableBackdrop: boolean;
}> = ({ tolgeeNamespace, id, onReconnect, reason, enableBackdrop }) => {
    console.log("[ConnectFailedMessage] rendering with:", { tolgeeNamespace, id, reason, enableBackdrop });
    const { t } = useTranslator([tolgeeNamespace]);
    const clickSound = useClickSound();
    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);

    const handleBackToLobby = () => {
        console.log("[ConnectFailedMessage] handleBackToLobby called");
        clickSound();
        updateURLContext({ gameId: 0 });
        backToRedirectUrl?.(redirectUrl);
    };

    const handleBackToLobbyWithReload = () => {
        console.log("[ConnectFailedMessage] handleBackToLobbyWithReload called");
        clickSound();
        updateURLContext({ backToLobby: true, gameId: 0 });
        redirectUrl ? backToRedirectUrl?.(redirectUrl) : window.location.reload();
    };

    const handleReconnect = () => {
        console.log("[ConnectFailedMessage] handleReconnect called");
        clickSound();
        onReconnect();
    };

    const renderLostConnectionButtons = () => {
        console.log("[ConnectFailedMessage] rendering lost connection buttons");
        return (
            <div className="flex justify-center gap-8">
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
                    "bg-modal-bg border border-modal-border-color shadow-modal",
                    "p-5"
                )}
            >
                <Image
                    src={`/static/images/icons/popup-mask.svg`}
                    alt="popup-mask"
                    className="absolute top-[-65px] left-[-74px]"
                    width={212}
                    height={212}
                />
                <div className="flex flex-col justify-center items-center gap-1">
                    <div className="w-[50px] h-[50px] bg-black/30 rounded-full flex justify-center items-center">
                        <Image src={`/static/images/icons/warning.svg`} alt="warning" width={33} height={29} />
                    </div>
                    <div className="text-base leading-[22px] font-semibold mb-[15px]">{t(`${tolgeeNamespace}.game_name_${id}`)}</div>
                    <div className="text-sm font-normal text-modal-text">
                        {t(reason, { gameName: tolgeeNamespace }).replaceTolgeeFormat().replace(tolgeeNamespace, "")}
                    </div>
                </div>

                <div className="mt-4">{renderButtons()}</div>
            </div>
        </BaseDialog>
    );
};
