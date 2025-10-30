import { FC } from "react";
import { cn } from '@shared/utils/merge-tailwind-util';

import { useClickSound } from '@shared/react-hooks';
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { ButtonPFGuide } from "../provably-fair/pf-guide";

const PFModalContainer: FC<{
    id?: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    onCloseModal: Function;
    isOpen: boolean;
    isOverlap?: boolean;
}> = ({ title, children, onCloseModal, isOpen, isOverlap, id }) => {
    const clickSound = useClickSound();

    const handleCloseModal = () => {
        clickSound();
        onCloseModal();
    };

    return (
        <BaseDialog
            type={ModalType.Full}
            enableBackdrop={true}
            isOverlap={isOverlap}
            extendedClassName="md:top-[10px]"
            onCloseModal={onCloseModal}
        >
            <div
                id={id}
                className={cn("grid grid-cols-1 grid-rows-[30px_calc(100%-30px)] h-full w-full rounded-t-2xl", {
                    grid: isOpen,
                    hidden: !isOpen,
                })}
            >
                <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center my-2">
                    <button className="absolute top-[23px] left-[12px] rotate-90" onClick={handleCloseModal}>
                        <i className="icon-back w-4 h-4 rotate-90"></i>
                    </button>
                    <div className="flex flex-1 items-center justify-center font-semibold text-lg leading-8">{title}</div>
                    <span className="cursor-pointer ml-auto relative z-10">
                        <ButtonPFGuide className="mt-1" />
                    </span>
                </div>

                <div className="grid grid-rows-[auto_1fr] h-full min-h-0 mt-2">{children}</div>
            </div>
        </BaseDialog>
    );
};

export default PFModalContainer;
