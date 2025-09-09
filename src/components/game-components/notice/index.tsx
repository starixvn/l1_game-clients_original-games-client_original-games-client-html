import React, { useEffect } from "react";
import Image from "next/image";
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
    isOpen?: boolean;
    isWarning: boolean;
    children: React.ReactNode;
}> = ({ children, onClose }) => {
    const closeDialog = useGlobalEventsStore((state) => state.closeDialog);

    useEffect(() => {
        if (closeDialog) {
            useGlobalEventsStore.getState().setCloseDialog(false);
        }
    }, [closeDialog]);

    const clickSound = useClickSound();

    return (
        <BaseDialog type={ModalType.Toast} isOpen={true} onCloseModal={onClose}>
            <div
                className={cn(
                    "absolute text-center py-4 pl-3 pr-10 rounded-2xl text-sm left-1/2 transform -translate-x-1/2 min-w-[343px] font-normal overflow-hidden bottom-0",
                    "bg-modal-red-bg border border-modal-border-color shadow-modal bg-modal-bg",
                    "flex justify-center gap-x-1"
                )}
            >
                <Image
                    src="/static/images/icons/toast-mask.svg"
                    alt="toast mask"
                    width={240}
                    height={240}
                    className="absolute left-[-80px] bottom-[-98px] w-[240px] h-[240px]"
                />

                {children}
                <div
                    onClick={() => {
                        clickSound();
                        onClose();
                    }}
                    className="cursor-pointer absolute right-[12px] rounded-full w-5 h-5 bg-[#EA1D41] flex items-center justify-center transition-all duration-300 hover:scale-110"
                    data-testid="close-btn"
                >
                    <span className="icon-close text-xs font-bold before:text-[#242C32] before:content-['\e908']"></span>
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
    const onCloseNotice = () => {
        notice?.onClose?.();
        clearNotice();
    };

    useEffect(() => {
        const duration = notice?.duration || 3;
        const timer = setTimeout(onCloseNotice, duration * 1000);
        return () => {
            clearTimeout(timer);
        };
    }, [notice]);

    if (notice) {
        const {
            gameName,
            message,
            roundId,
            minBet,
            maxBet,
            errorCode,
            isWarning,
            betChoice1,
            betChoice2,
            hedgeBetGroup,
            adjustBetNoticePosition,
        } = notice;

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

        return (
            <BaseNotice
                {...{
                    onClose: onCloseNotice,
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
