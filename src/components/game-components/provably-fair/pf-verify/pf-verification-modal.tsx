import { FC, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCommonTranslate } from "../../../../_shared/react-hooks";
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";
import { usePFContext } from "../../../../_shared/react-contexts/game-state-context/pf/pf-context";
import usePFStore from "../../../../_shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/shallow";

const PFVerificationModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowPFVerification, pfVerifyModalData, togglePFVerification, updatePFVerify } = usePFStore(
        useShallow(
            (state) => ({
                isShowPFVerification: state.isShowPFVerification,
                pfVerifyModalData: state.pfVerifyModalData,
                togglePFVerification: state.togglePFVerification,
                updatePFVerify: state.updatePFVerify,
            })
        )
    );

    const handleCloseModal = () => {
        togglePFVerification(false);
    };

    useEffect(() => {
        if (!isShowPFVerification) {
            updatePFVerify({
                ...pfVerifyModalData,
                editedMergeClientSeed: null,
            });
        }
    }, [isShowPFVerification]);

    return (
        isShowPFVerification &&
        createPortal(
            <ModalContainer
                id="pf-verify-detail-modal"
                title={
                    <div>
                        <ButtonPFGuide />
                        {translateCommon("pf_title_verification").capitalizeFirstLetter()}
                    </div>
                }
                isOpen={isShowPFVerification}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                {children}
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

export default PFVerificationModal;
