import { useCommonTranslate } from "@shared/react-hooks";
import usePopupStore from "@shared/stores/popup-store/popup-store";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useShallow } from "zustand/react/shallow";
import ModalContainer from "../modal-container";

const BetDetailModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowBetDetail, toggleBetDetail } = usePopupStore(
        useShallow((state) => ({
            isShowBetDetail: state.isShowBetDetail,
            toggleBetDetail: state.toggleBetDetail,
        }))
    );
    console.log("isShowBetDetail", isShowBetDetail);
    const dashboardElement = useMemo(() => {
        return document.getElementById("dashboard");
    }, []);

    const handleCloseModal = useCallback(() => {
        toggleBetDetail(false);
    }, [toggleBetDetail]);

    return (
        isShowBetDetail &&
        dashboardElement &&
        createPortal(
            <ModalContainer
                id="bet-detail"
                title={translateCommon("bet_detail")}
                isOpen={true}
                onCloseModal={handleCloseModal}
                isOverlap={false}
            >
                {children}
            </ModalContainer>,
            dashboardElement
        )
    );
};

export default BetDetailModal;
