import { FC, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCommonTranslate } from "../../../../_shared/react-hooks";
import usePFStore from "../../../../_shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/shallow";
import usePopupStore from "../../../../_shared/stores/popup-store/popup-store";
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";

const PFVerificationModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { pfVerifyModalData, updatePFVerify } = usePFStore(
        useShallow((state) => ({
            pfVerifyModalData: state.pfVerifyModalData,
            updatePFVerify: state.updatePFVerify,
        }))
    );

    const { isShowPFVerification, togglePFVerification } = usePopupStore(
        useShallow((state) => ({
            isShowPFVerification: state.isShowPFVerification,
            togglePFVerification: state.togglePFVerification,
        }))
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
