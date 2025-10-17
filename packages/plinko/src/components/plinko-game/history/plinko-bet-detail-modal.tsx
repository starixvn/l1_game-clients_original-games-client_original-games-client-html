import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import usePopupStore from "@shared/stores/popup-store/popup-store";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useShallow } from "zustand/react/shallow";
import BaseDialog from "@shared/components/game-components/base-dialog";
import { ModalType } from "@shared/components/game-components/base-dialog/type";
import { cn } from "@shared/utils/merge-tailwind-util";
import { modalStackManager } from "@shared/utils/modal-stack-manager";

const PlinkoBetDetailModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowBetDetail, toggleBetDetail } = usePopupStore(
        useShallow((state) => ({
            isShowBetDetail: state.isShowBetDetail,
            toggleBetDetail: state.toggleBetDetail,
        }))
    );
    const clickSound = useClickSound();

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
            <BaseDialog
                type={ModalType.Full}
                isOpen={isShowBetDetail}
                onCloseModal={handleCloseModal}
                enableBackdrop={true}
                extendedClassName="w-full h-fit left-0 top-auto md:top-1/2 md:-translate-y-1/2 left-1/2 -translate-x-1/2 md:max-w-3xl bg-[linear-gradient(180deg,_#0854B2_0%,_#05264D_38.5%,_#060D15_100%)]"
            >
                <div
                id="plinko-bet-detail-modal"
                className={cn("flex flex-col w-full rounded-t-2xl", {
                    flex: isShowBetDetail,
                    hidden: !isShowBetDetail,
                })}
            >
                {/* Header - Fixed height */}
                <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center my-2 flex-shrink-0">
                    <div className="flex flex-1 items-center justify-center font-semibold text-lg leading-[22px]">{translateCommon("bet_detail")}</div>
                    <span
                        className="cursor-pointer ml-auto relative z-10"
                        onClick={() => {
                            clickSound();
                            handleCloseModal();
                            modalStackManager.closeTopModal();
                        }}
                    >
                        <i className="icon-close text-sm w-4 h-4"></i>
                    </span>
                </div>

                {/* Content - Flexible height */}
                <div className="md:mb-0 mb-7">{children}</div>
            </div>
            </BaseDialog>,
            dashboardElement
        )
    );
};

export default PlinkoBetDetailModal;
