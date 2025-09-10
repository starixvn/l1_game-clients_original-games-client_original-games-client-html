import { FC } from "react";
import { cn } from '@shared/utils/merge-tailwind-util';

import { useClickSound } from '@shared/react-hooks';
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { modalStackManager } from '@shared/utils/modal-stack-manager';

const ModalContainer: FC<{
    id?: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    onCloseModal: Function;
    isOpen: boolean;
    isOverlap?: boolean;
}> = ({ title, children, onCloseModal, isOpen, isOverlap, id }) => {
    const clickSound = useClickSound();

    return (
        <BaseDialog
            type={ModalType.Full}
            enableBackdrop={true}
            isOverlap={isOverlap}
            onCloseModal={onCloseModal}
            extendedClassName="md:top-[10px] md:bottom-auto md:max-w-3xl md:h-[calc(90vh/var(--scale-factor,1))] md:max-h-[calc(730px/var(--scale-factor,1))] md:mx-auto"
        >
            <div
                id={id}
                className={cn("flex flex-col h-full w-full rounded-t-2xl", {
                    flex: isOpen,
                    hidden: !isOpen,
                })}
            >
                {/* Header - Fixed height */}
                <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center my-2 flex-shrink-0">
                    <div className="flex flex-1 items-center justify-center font-semibold text-lg leading-[22px]">{title}</div>
                    <span
                        className="cursor-pointer ml-auto relative z-10"
                        onClick={() => {
                            clickSound();
                            onCloseModal();
                            modalStackManager.closeTopModal();
                        }}
                    >
                        <i className="icon-close text-sm w-4 h-4"></i>
                    </span>
                </div>

                {/* Content - Flexible height */}
                <div className="flex-1 min-h-0 overflow-hidden mt-2">{children}</div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
