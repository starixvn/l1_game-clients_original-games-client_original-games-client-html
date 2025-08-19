import { FC, ReactNode } from "react";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { createPortal } from "react-dom";

const BetDetailModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowBetDetail, toggleBetDetail } = useGameStore();

    const handleCloseModal = () => {
        toggleBetDetail(false);
    };

    const dashboardElement = document.getElementById("dashboard");

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
