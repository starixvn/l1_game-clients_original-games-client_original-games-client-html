import { memo, useEffect, useRef, useState } from "react";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useCommonTranslate } from "@shared";
import { numberWithCommas } from "@shared/helpers";
import { isMobile } from "react-device-detect";

export const WinningAmountEffect = () => {
    const finish = usePlinkoGameStore((state) => state.finishedBall);
    const [winAmount, setWinAmount] = useState(0);
    const timerRef = useRef<NodeJS.Timeout>(null);
    const { t } = useCommonTranslate();

    useEffect(() => {
        clearTimeout(timerRef.current);
        setWinAmount((prev) => prev + (finish?.winAmount ?? 0));
        timerRef.current = setTimeout(() => {
            setWinAmount(0);
        }, 3000);
        return () => {
            clearTimeout(timerRef.current);
        };
    }, [finish]);

    if (!winAmount) {
        return <div className="h-10"></div>;
    }

    const baseClasses = "h-10 py-3 text-center text-[var(--color-winning-highlight)] text-lg font-bold uppercase md:text-xl";
    const mobileClasses = isMobile ? "absolute bottom-[-10px] left-0 right-0 z-[200]" : "relative top-[-10px]";

    return (
        <div className={`${baseClasses} ${mobileClasses}`}>
            {t("win")} {numberWithCommas(winAmount, 2)}
        </div>
    );
};

export default memo(WinningAmountEffect);
