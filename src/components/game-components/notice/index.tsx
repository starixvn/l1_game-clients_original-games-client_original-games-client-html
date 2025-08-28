import React, { useEffect } from "react";
import { createOptionForHedgeBetGroup, getExtendMessageByErrorCode } from "../../../_shared/helpers";
import { numberWithCommas } from "../../../_shared/helpers/number-helper";
import { useGameContext } from "../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useGlobalEventsStore } from "../../../_shared/stores/global-events-store/global-events-store";
import { useNoticeStore } from "../../../_shared/stores/notice-store/notice-store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "../../../_shared/utils/merge-tailwind-util";

const BaseNotice: React.FC<{
    onClose: () => void;
    duration: number;
    isOpen?: boolean;
    isWarning: boolean;
    children: React.ReactNode;
    adjustBetNoticePosition: boolean;
}> = ({ children, onClose, duration = 3, adjustBetNoticePosition }) => {
    const closeDialog = useGlobalEventsStore((state) => state.closeDialog);

    useEffect(() => {
        const timer = setTimeout(onClose, duration * 1000);
        return () => {
            clearTimeout(timer);
        }
    }, [duration, onClose]);

    useEffect(() => {
        if (closeDialog) {
            onClose();
            // Reset the flag
            useGlobalEventsStore.getState().setCloseDialog(false);
        }
    }, [closeDialog, onClose]);

    const clickSound = useClickSound();

    const GradientCircle = () => {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="152"
                height="54"
                viewBox="0 0 152 54"
                fill="none"
                className="absolute left-[-80px] bottom-[-98px] w-[240px] h-[240px]"
            >
                <circle cx="32" cy="32" r="120" fill="url(#paint0_radial_1944_13056)" fill-opacity="0.2" />
                <defs>
                    <radialGradient
                        id="paint0_radial_1944_13056"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(32 32) rotate(90) scale(120)"
                    >
                        <stop stop-color="#F04248" />
                        <stop offset="1" stop-color="#F04248" stop-opacity="0" />
                    </radialGradient>
                </defs>
            </svg>
        );
    };

    const CloseButton = () => {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                    d="M6.4 15L10 11.4L13.6 15L15 13.6L11.4 10L15 6.4L13.6 5L10 8.6L6.4 5L5 6.4L8.6 10L5 13.6L6.4 15ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88333 18.6873 3.825 17.975 2.925 17.075C2.025 16.175 1.31267 15.1167 0.788 13.9C0.262667 12.6833 0 11.3833 0 10C0 8.61667 0.262667 7.31667 0.788 6.1C1.31267 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.31233 6.1 0.787C7.31667 0.262333 8.61667 0 10 0C11.3833 0 12.6833 0.262333 13.9 0.787C15.1167 1.31233 16.175 2.025 17.075 2.925C17.975 3.825 18.6873 4.88333 19.212 6.1C19.7373 7.31667 20 8.61667 20 10C20 11.3833 19.7373 12.6833 19.212 13.9C18.6873 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6873 13.9 19.212C12.6833 19.7373 11.3833 20 10 20Z"
                    fill="#EA1D41"
                />
            </svg>
        );
    };

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={onClose}>
            <div
                className={cn(
                    "absolute text-center py-4 px-3 rounded-2xl text-sm left-1/2 transform -translate-x-1/2 min-w-[343px] font-normal",
                    "bottom-1/2 translate-y-1/2 z-modal overflow-hidden",
                    "bg-modal-red-bg border border-modal-border-color shadow-modal bg-modal-bg",
                    "flex justify-center gap-x-1"
                )}
            >
                <GradientCircle />

                {children}
                <div
                    onClick={() => {
                        clickSound();
                        onClose();
                    }}
                    className="cursor-pointer absolute right-[12px]"
                >
                    <CloseButton />
                </div>
            </div>
        </BaseDialog>
    );
};

export const NoticeDialog = () => {
    const { t } = useTranslator();
    const { tolgeeNamespace } = useGameContext();
    const { notice, clearNotice } = useNoticeStore(
        useShallow((state) => ({
            notice: state.notice,
            clearNotice: state.clearNotice,
        }))
    );

    console.log("notice In NoticeDialog::: ", notice);

    if (notice) {
        const {
            gameName,
            message,
            roundId,
            duration,
            minBet,
            maxBet,
            errorCode,
            isWarning,
            betChoice1,
            betChoice2,
            onClose,
            hedgeBetGroup,
            adjustBetNoticePosition,
        } = notice;

        const closeNotice = () => {
            clearNotice();
        };

        const onCloseNotice = onClose || (() => closeNotice());
        let hedgeBet = {};
        if (hedgeBetGroup) {
            hedgeBet = createOptionForHedgeBetGroup(hedgeBetGroup, tolgeeNamespace);
        }

        const params = {
            gameName,
            roundId,
            gameRoundId: roundId,
            minBet: minBet !== undefined ? numberWithCommas(+minBet) : undefined,
            maxBet: maxBet !== undefined ? numberWithCommas(+maxBet) : undefined,
            errorCode: errorCode,
            betChoice1,
            betChoice2,
            ...hedgeBet,
        };
        console.log("params::: ", params);


        console.log("t(`${message}`, params, { noWrap: true }).replaceTolgeeFormat()::: ", t(`${message}`, params, { noWrap: true }).replaceTolgeeFormat());

        return (
            <BaseNotice
                {...{
                    onClose: onCloseNotice,
                    duration: duration || 3,
                    isWarning: isWarning || false,
                    adjustBetNoticePosition: adjustBetNoticePosition || false,
                }}
            >
                <div className="text-modal-text whitespace-pre-wrap text-sm leading-[22px] spacing-[0.28px]">
                    {t(`${message}`, params, { noWrap: true }).replaceTolgeeFormat()}
                    {getExtendMessageByErrorCode(errorCode || "")}
                </div>
            </BaseNotice>
        );
    }

    return <></>;
};
