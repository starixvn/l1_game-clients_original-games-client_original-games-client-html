import ModalContainer from "@shared/components/game-components/modal-container";
import { memo } from "react";
import { createPortal } from "react-dom";

const AutoBetInstruction = ({
    setIsShowAutoBetInstruction,
}: {
    setIsShowAutoBetInstruction: (isShowAutoBetInstruction: boolean) => void;
}) => {
    const handleClose = () => {
        setIsShowAutoBetInstruction(false);
    };
    return createPortal(
        <ModalContainer id="bet-detail" title={"Auto Mode Instruction"} isOpen={true} onCloseModal={handleClose} isOverlap={false}>
            <div className="px-5">
                <div className="text-[#a6c0fc] text-base font-semibold mb-4">What is Auto Mode?</div>
                <div className="text-sm text-[var(--text-content-color)]">Auto Mode is .</div>
            </div>
        </ModalContainer>,
        document.getElementById("dashboard")
    );
};

export default memo(AutoBetInstruction);
