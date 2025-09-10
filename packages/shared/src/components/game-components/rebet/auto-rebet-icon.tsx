import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAutoRebet, useBalance, useClickSound, useCommonTranslate } from '@shared/merged/_shared/react-hooks';
import AutoRebetPopup from "./auto-rebet-popup";
import useBettingStore from '@shared/merged/_shared/stores/betting-store/betting-store';
import { broadcastNotice, getNotice } from '@shared/merged/_shared/helpers';
import { NoticeErrorCode } from '@shared/merged/_shared/constants/error-code-dictionary';
const Tooltip = dynamic(() => import("../tooltip"), { ssr: false });

const AutoRebetIcon = () => {
    const isAutoRebetActive = useBettingStore((state) => state.isAutoRebetActive);
    const { remainingRounds, startAutoRebet, stopAutoRebet, isEnabled: isRebetEnabled } = useAutoRebet();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const ownBets = useBettingStore((state) => state.ownBets);
    const balance = useBalance();
    const clickSound = useClickSound();
    const { t } = useCommonTranslate();

    useEffect(() => {
        setIsEnabled(isRebetEnabled || isAutoRebetActive);
    }, [isRebetEnabled, isAutoRebetActive]);

    const handleIconClick = () => {
        clickSound();
        if (!isEnabled) {
            return;
        }
        if (isAutoRebetActive) {
            stopAutoRebet();
            return;
        }
        const totalAmount = Object.values(ownBets).reduce((acc, bet) => acc + bet, 0);
        if (balance < totalAmount) {
            broadcastNotice(getNotice(NoticeErrorCode.notEnoughMoney, false));
            return;
        }
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleConfirmAutoRebet = (rounds: number) => {
        startAutoRebet(rounds);
        setIsPopupOpen(false);
    };

    return (
        <>
            <div className="relative group">
                <Tooltip message={t("auto_rebet")} />
                <div
                    className={`rounded-full w-[52px] h-[52px] flex items-center justify-center border border-solid bg-[#1a274999] border-[#0097ff33] transition-all duration-300 ${
                        isEnabled ? "cursor-pointer hover:scale-110 opacity-100" : "opacity-50 cursor-auto"
                    }"`}
                    onClick={handleIconClick}
                >
                    {isAutoRebetActive ? (
                        <>
                            <div className="absolute">
                                <div className="relative -top-[16px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white flex items-center justify-center font-semibold">
                                    {remainingRounds === Infinity ? "∞" : remainingRounds}
                                </div>
                            </div>
                            <i className="icon-stop-auto-bet text-xl"></i>
                        </>
                    ) : (
                        <i className="icon-auto-bet text-xl"></i>
                    )}
                </div>
            </div>

            {isPopupOpen && <AutoRebetPopup onClose={handleClosePopup} onConfirm={handleConfirmAutoRebet} />}
        </>
    );
};

export default memo(AutoRebetIcon);
