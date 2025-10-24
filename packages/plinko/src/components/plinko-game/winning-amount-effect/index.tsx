import { memo, useEffect, useRef, useState } from "react";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useCommonTranslate } from "@shared";
import { numberWithCommas } from "@shared/helpers";

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
        return <div className="h-7 md:h-10"></div>;
    }

    return (
        <div className={`h-7 pt-1 text-center text-[var(--color-winning-highlight)] text-lg font-bold uppercase md:text-xl md:h-10`}>
            {t("win")} {numberWithCommas(winAmount, 2)}
        </div>
    );
};

export default memo(WinningAmountEffect);
