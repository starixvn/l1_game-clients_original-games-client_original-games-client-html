import React, { useState, useCallback, memo, useRef } from "react";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { cn } from '@shared/utils/merge-tailwind-util';
import styles from "./auto-rebet-popup.module.scss";
import { useClickOutside, useClickSound, useCommonTranslate } from '@shared/react-hooks';

interface AutoRebetPopupProps {
    onClose: () => void;
    onConfirm: (rounds: number) => void;
}

const PRESET_ROUNDS = [10, 25, 50, 75, 100, 500, 1000, Infinity];

const AutoRebetPopup: React.FC<AutoRebetPopupProps> = ({ onClose, onConfirm }) => {
    const [rounds, setRounds] = useState<number>(1);
    const { t } = useCommonTranslate();
    const clickSound = useClickSound();
    const wrapperRef = useRef<HTMLDivElement>(null);
    useClickOutside([wrapperRef], onClose);
    const handleCustomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setRounds(value);
    }, []);

    const handleConfirm = useCallback(
        (rounds: number, e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();
            clickSound();
            if (rounds <= 0) {
                return;
            }
            onConfirm(rounds);
        },
        [onConfirm, clickSound]
    );

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <div ref={wrapperRef} className="md:absolute md:w-full md:z-[var(--popup-index)] pointer-events-auto">
            <BaseDialog
                type={ModalType.Rebet}
                onCloseModal={handleClose}
                enableBackdrop={true}
                isBlockScroll={false}
                extendedClassName="w-full left-0 p-0 -bottom-0 md:w-[425px] md:left-0 md:right-0 md:mx-auto"
            >
                <div className="p-3 py-6 md:px-5">
                    <div className="relative w-full">
                        <div className="text-white text-lg font-semibold text-center">{t("auto_rebet")}</div>
                        <button onClick={handleClose} className="absolute top-1/2 right-0 -translate-y-1/2">
                            <i className="icon-close text-sm w-4 h-4"></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 my-6 md:gap-2 md:my-4">
                        {PRESET_ROUNDS.map((number) => (
                            <button
                                key={number}
                                onClick={(e) => handleConfirm(number, e)}
                                className={`${cn(
                                    "flex items-center justify-center h-11 gap-1 text-white text-base font-medium transition-all duration-200",
                                    "hover:scale-105"
                                )} ${styles.button}`}
                            >
                                <span>{number === Infinity ? "∞" : number}</span>
                                <i className="icon-auto-bet-round text-3xl w-4 "></i>
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">{t("label_custom_rounds")}</label>
                        <div className="flex justify-between">
                            <input
                                type="number"
                                step={1}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={rounds}
                                onChange={handleCustomInputChange}
                                className="input text-white flex-1 mr-3 py-3 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 text-center"
                                placeholder="Enter rounds"
                            />

                            <button
                                onClick={(e) => handleConfirm(rounds, e)}
                                className={`${styles["btn-confirm"]} py-2 px-6 rounded-xl transition-all duration-200 flex items-center gap-0 hover:scale-105 active:scale-95`}
                            >
                                {t("button_confirm")}
                                <i className="icon-auto-bet-round text-3xl w-4 before:text-[#624000] before:content-['\e90b']"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
};

export default memo(AutoRebetPopup);
