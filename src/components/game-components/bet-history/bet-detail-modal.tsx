import { FC, ReactNode, useMemo, useCallback } from "react";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import usePopupStore from "../../../_shared/stores/popup-store/popup-store";
import { createPortal } from "react-dom";
import { useShallow } from "zustand/react/shallow";

const BetDetailModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowBetDetail, toggleBetDetail } = usePopupStore(useShallow((state) => ({
        isShowBetDetail: state.isShowBetDetail,
        toggleBetDetail: state.toggleBetDetail,
    })));

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
                isOverlap={true}
            >
                {children}
            </ModalContainer>,
            dashboardElement
        )
    );
};

export default BetDetailModal;
