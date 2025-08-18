import React, { useEffect } from "react";
import { createOptionForHedgeBetGroup, getExtendMessageByErrorCode } from "../../../_shared/helpers";
import { numberWithCommas } from "../../../_shared/helpers/number-helper";
import { useGameContext } from "../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./notice.module.scss";
import { NoticeModel } from "../../game-base/type";
import {
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../_shared/helpers/message-transmitter/global-transmitter";
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

        const onCloseHandlerId = registerGlobalMessageEvent(GlobalTransmitterEvent.CLOSE_DIALOG, () => {
            onClose();
        });

        return () => {
            clearTimeout(timer);
            unsubscribeGlobalMessageEvent(onCloseHandlerId as any);
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

    useEffect(() => {
        const noticeHandlerId = registerGlobalMessageEvent(GlobalTransmitterEvent.NOTICE, ({ notice }) => {
            if (notice) {
                useNoticeStore.getState().showNotice(notice);
            } else {
                useNoticeStore.getState().clearNotice();
            }
        });

        return () => {
            unsubscribeGlobalMessageEvent(noticeHandlerId as any);
        };
    }, []);

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
