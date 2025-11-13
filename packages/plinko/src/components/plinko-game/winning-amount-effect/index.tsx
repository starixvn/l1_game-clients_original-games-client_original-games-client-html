import { memo, useEffect, useRef, useState } from "react";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { numberWithCommas } from "@shared/helpers";
import styles from "./style.module.scss";

export const WinningAmountEffect = () => {
    const finish = usePlinkoGameStore((state) => state.finishedBall);
    const [winAmount, setWinAmount] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);
    const timerRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        clearTimeout(timerRef.current);
        setWinAmount((prev) => prev + (finish?.winAmount ?? 0));
        setAnimationKey((prev) => prev + 1);
        timerRef.current = setTimeout(() => {
            setWinAmount(0);
            setAnimationKey(0);
        }, 3000);
        return () => {
            clearTimeout(timerRef.current);
        };
    }, [finish]);

    if (!winAmount) {
        return <div className="h-6"></div>;
    }

    return (
        <div
            key={animationKey}
            className={`${styles["win-animation"]} h-6 pt-1 text-center text-[#FFFA67] text-lg font-bold uppercase md:text-2xl md:pt-2`}
        >
            +{numberWithCommas(winAmount, 2)}
        </div>
    );
};

export default memo(WinningAmountEffect);
