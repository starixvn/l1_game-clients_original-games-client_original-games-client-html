import { memo, useEffect, useRef, useState } from "react";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useCommonTranslate } from "@shared";

export const WinningAmountEffect = () => {
    const finish = usePlinkoGameStore((state) => state.finish);
    const [winAmount, setWinAmount] = useState(0);
    const timerRef = useRef<NodeJS.Timeout>(null);
    const { t } = useCommonTranslate();

    useEffect(() => {
        clearTimeout(timerRef.current);
        setWinAmount((prev) => Number((prev + (finish?.winAmount ?? 0)).toFixed(2)));
        timerRef.current = setTimeout(() => {
            setWinAmount(0);
        }, 3000);
        return () => {
            clearTimeout(timerRef.current);
        };
    }, [finish]);

    return (
        winAmount > 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2 text-[var(--color-winning-highlight)] text-lg font-bold uppercase md:bottom-[4.5rem] md:text-xl">
                {t("win")} {winAmount}
            </div>
        )
    );
};

export default memo(WinningAmountEffect);
