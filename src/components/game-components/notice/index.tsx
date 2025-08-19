import React, { useEffect } from "react";
import { createOptionForHedgeBetGroup, getExtendMessageByErrorCode } from "../../../_shared/helpers";
import { numberWithCommas } from "../../../_shared/helpers/number-helper";
import { useGameContext } from "../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./notice.module.scss";
import { useGlobalEventsStore } from "../../../_shared/stores/global-events-store/global-events-store";
import { useNoticeStore } from "../../../_shared/stores/notice-store/notice-store";

const BaseNotice: React.FC<{
    onClose: () => void;
    duration: number;
    isOpen?: boolean;
    isWarning: boolean;
    children: React.ReactNode;
    adjustBetNoticePosition: boolean;
}> = ({ children, onClose, duration = 3, adjustBetNoticePosition }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration * 1000);

        // Subscribe to close dialog events from the store
        const unsubscribe = useGlobalEventsStore.subscribe((state) => {
            if (state.closeDialog) {
                onClose();
                // Reset the flag
                useGlobalEventsStore.getState().setCloseDialog(false);
            }
        });

        return () => {
            clearTimeout(timer);
            unsubscribe();
        }
    }, []);

    const clickSound = useClickSound();

    const adjustBetNoticePositionClass = adjustBetNoticePosition ? "modal-center adjusted-bet-notice" : "modal-center";

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={onClose}>
            <div className={`${adjustBetNoticePositionClass} red-color`}>
                <span
                    className={`icon-close ${Styles["icon-close"]}`}
                    onClick={() => {
                        clickSound();
                        onClose();
                    }}
                    data-testid="close-btn"
                ></span>
                {children}
            </div>
        </BaseDialog>
    );
};

export const NoticeDialog = () => {
    const { t } = useTranslator();
    const { tolgeeNamespace } = useGameContext();
    const { notice, clearNotice } = useNoticeStore();



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
            minBet: numberWithCommas(+minBet),
            maxBet: numberWithCommas(+maxBet),
            errorCode: errorCode,
            betChoice1,
            betChoice2,
            ...hedgeBet,
        };

        return (
            <BaseNotice {...{ onClose: onCloseNotice, duration, isWarning, adjustBetNoticePosition }}>
                <div className={Styles["notice-content"]}>
                    {t(`${message}`, params, { noWrap: true }).replaceTolgeeFormat()}
                    {getExtendMessageByErrorCode(errorCode)}
                </div>
            </BaseNotice>
        );
    }

    return <></>;
};
