import { FC } from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import Image from "next/image";

import { useClickSound } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import usePopupStore from "../../../_shared/stores/popup-store/popup-store";
import { useShallow } from "zustand/react/shallow";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../_shared/helpers";

const PFModalContainer: FC<{
    id?: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    onCloseModal: Function;
    isOpen: boolean;
    isOverlap?: boolean;
}> = ({ title, children, onCloseModal, isOpen, isOverlap, id }) => {
    const clickSound = useClickSound();

    const { togglePFSetting, toggleExpandGuideFirst } = usePopupStore(
        useShallow((state) => ({
            togglePFSetting: state.togglePFSetting,
            toggleExpandGuideFirst: state.toggleExpandGuideFirst,
        }))
    );

    const handleOpenPFSetting = () => {
        clickSound();
        togglePFSetting(true);
        toggleExpandGuideFirst(true);
        AnalyticsHelper.trackFunction({ function: TrackingFunction.PFGuide, action: TrackingAction.Open });
    };

    const handleCloseModal = () => {
        clickSound();
        onCloseModal();
    };

    return (
        <BaseDialog type={ModalType.Full} enableBackdrop={true} isOverlap={isOverlap}>
            <div
                id={id}
                className={cn("grid grid-cols-1 grid-rows-[30px_calc(100%-30px)] h-full w-full rounded-t-2xl", {
                    grid: isOpen,
                    hidden: !isOpen,
                })}
            >
                <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center my-2">
                    <button
                        className="absolute top-[25px] left-[12px] rotate-90"
                        onClick={handleCloseModal}
                    >
                        <Image src="/static/images/icons/chevron-down.svg" alt="icon-back" width={16} height={16} />
                    </button>
                    <div className="flex flex-1 items-center justify-center font-semibold text-[18px] leading-8">{title}</div>
                    <span className="cursor-pointer ml-auto relative z-10" onClick={handleOpenPFSetting}>
                        <Image src="/static/images/icons/question-mark.svg" alt="guide" width={32} height={32} />
                    </span>
                </div>

                <div
                    className="grid grid-rows-[auto_1fr] h-full min-h-0"
                >
                    {children}
                </div>
            </div>
        </BaseDialog>
    );
};

export default PFModalContainer;
