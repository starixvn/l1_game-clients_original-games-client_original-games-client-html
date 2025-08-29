import React, { useState, useCallback, memo } from "react";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import styles from "./auto-rebet-popup.module.scss";

interface AutoRebetPopupProps {
    onClose: () => void;
    onConfirm: (rounds: number) => void;
}

const PRESET_ROUNDS = [10, 25, 50, 75, 100, 500, 1000, Infinity];

const AutoRebetPopup: React.FC<AutoRebetPopupProps> = ({ onClose, onConfirm }) => {
    const [rounds, setRounds] = useState<number>(1);

    const handleCustomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setRounds(value);
    }, []);

    const handleConfirm = useCallback(
        (rounds: number) => {
            if (rounds <= 0) {
                return;
            }
            onConfirm(rounds);
            onClose();
        },
        [onConfirm, onClose]
    );

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <div className="md:absolute md:w-full h-full md:top-[50%] md:-translate-y-1/2 md:z-[var(--popup-index)]">
            <BaseDialog
                type={ModalType.Rebet}
                onCloseModal={handleClose}
                enableBackdrop={true}
                extendedClassName="w-full left-0 p-0 -bottom-0 md:w-[425px] md:left-[50%] md:-translate-x-1/2"
            >
                <div className="p-3 py-6">
                    <div className="relative w-full">
                        <h2 className="text-white text-lg font-semibold text-center">Auto Rebet</h2>
                        <button
                            onClick={handleClose}
                            className="absolute top-0 right-0 text-white hover:text-gray-300 transition-colors duration-200 text-2xl font-semibold leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 my-6 md:gap-2 md:my-4">
                        {PRESET_ROUNDS.map((number) => (
                            <button
                                key={number}
                                onClick={() => handleConfirm(number)}
                                className={`${cn(
                                    "flex items-center justify-center gap-1 text-white text-[16px] font-medium py-3 px-2 transition-all duration-200 md:py-2",
                                    "hover:scale-105"
                                )} ${styles.button}`}
                            >
                                <span>{number === Infinity ? "∞" : number}</span>
                                <Icon />
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Custom number of rounds</label>
                        <div className="flex justify-between">
                            <input
                                type="number"
                                step={1}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={rounds}
                                onChange={handleCustomInputChange}
                                className="input text-white w-full mr-3 py-3 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 text-center"
                                placeholder="Enter rounds"
                            />

                            <button
                                onClick={() => handleConfirm(rounds)}
                                className={`${styles["btn-confirm"]} py-2 px-6 rounded-xl transition-all duration-200 flex items-center gap-0 hover:scale-105 active:scale-95`}
                            >
                                <span>Confirm</span>
                                <Icon color="#624000" />
                            </button>
                        </div>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
};
const Icon = ({ color = "#F9FDFF" }: { color?: string }) => {
    return (
        <svg width="31" height="32" viewBox="0 0 31 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_1373_5476)">
                <path
                    d="M19.625 14.268C20.9583 15.0378 20.9583 16.9623 19.625 17.7321L13.625 21.1962C12.2917 21.966 10.625 21.0037 10.625 19.4641L10.625 12.5359C10.625 10.9963 12.2917 10.034 13.625 10.8038L19.625 14.268Z"
                    fill={color}
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_1373_5476"
                    x="0.625"
                    y="0.532959"
                    width="30"
                    height="30.9341"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1373_5476" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1373_5476" result="shape" />
                </filter>
            </defs>
        </svg>
    );
};
export default memo(AutoRebetPopup);
