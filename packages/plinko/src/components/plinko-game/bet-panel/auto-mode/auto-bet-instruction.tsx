import BaseDialog from "@shared/components/game-components/base-dialog";
import { ModalType } from "@shared/components/game-components/base-dialog/type";
import { memo } from "react";

const AutoBetInstruction = ({
    setIsShowAutoBetInstruction,
}: {
    setIsShowAutoBetInstruction: (isShowAutoBetInstruction: boolean) => void;
}) => {
    const handleClose = () => {
        setIsShowAutoBetInstruction(false);
    };
    return (
        <div className="">
            <BaseDialog
                onCloseModal={handleClose}
                type={ModalType.Full}
                enableBackdrop={true}
                extendedClassName="bg-popup-gradient top-[30%] p-4 md:top-[10px] md:bottom-auto md:max-w-3xl md:h-[calc(90vh/var(--scale-factor,1))] md:max-h-[calc(730px/var(--scale-factor,1))] md:mx-auto"
            >
                <div>
                    <div className="relative w-full">
                        <div className="text-white text-lg font-semibold text-center">Auto Mode Instruction</div>
                        <button onClick={handleClose} className="absolute top-1/2 right-0 -translate-y-1/2">
                            <i className="icon-close text-sm md:text-base w-4 h-4"></i>
                        </button>
                    </div>

                    <div className="text-[#a6c0fc] text-base font-semibold my-4">What is Auto Mode?</div>
                    <div className="text-sm text-[var(--text-content-color)]">Auto Mode is .</div>
                </div>
            </BaseDialog>
        </div>
    );
};

export default memo(AutoBetInstruction);
