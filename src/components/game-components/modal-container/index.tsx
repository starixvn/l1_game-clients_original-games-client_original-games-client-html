import { FC } from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import Image from "next/image";

import { useClickSound } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";

const ModalContainer: FC<{
    id?: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    onCloseModal: Function;
    isOpen: boolean;
    isOverlap?: boolean;
    extendedClassName?: string;
}> = ({ title, children, onCloseModal, isOpen, isOverlap, id, extendedClassName }) => {
    const clickSound = useClickSound();

    return (
        <BaseDialog type={ModalType.Full} enableBackdrop={true} isOverlap={isOverlap} extendedClassName={extendedClassName}>
            <div
                id={id}
                className={cn("flex flex-col h-full w-full rounded-t-2xl", {
                    flex: isOpen,
                    hidden: !isOpen,
                })}
            >
                {/* Header - Fixed height */}
                <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center my-2 flex-shrink-0">
                    <div className="flex flex-1 items-center justify-center font-semibold text-[18px] leading-[22px]">{title}</div>
                    <span
                        className="cursor-pointer ml-auto relative z-10"
                        onClick={() => {
                            clickSound();
                            onCloseModal();
                        }}
                    >
                        <Image src="/static/images/icons/close.svg" className="w-4 h-4" alt="close" width={16} height={16} />
                    </span>
                </div>

                {/* Content - Flexible height */}
                <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
