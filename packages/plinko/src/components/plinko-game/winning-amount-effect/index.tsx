import { memo, useEffect, useRef, useState } from "react";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useCommonTranslate } from "@shared";
import { numberWithCommas } from "@shared/helpers";
import { logger } from "@plinko/services/logger";

export const WinningAmountEffect = () => {
    logger.startWorkflow('winning-amount-effect-init', 'game-init', 'Initialize winning amount effect component');

    const finish = usePlinkoGameStore((state) => state.finishedBall);
    const [winAmount, setWinAmount] = useState(0);
    const timerRef = useRef<NodeJS.Timeout>(null);
    const { t } = useCommonTranslate();

    // Log initialization
    logger.logGameEvent('winning-amount-init', {
        initialState: winAmount > 0 ? 'has-win' : 'no-win',
        deviceInfo: {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        }
    });

    // Cleanup logging on unmount
    useEffect(() => {
        return () => {
            logger.logUIEvent('winning-amount-cleanup', {
                reason: 'component-unmount',
                hadActiveTimeout: !!timerRef.current,
                finalWinAmount: winAmount,
                deviceInfo: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                }
            });
        };
    }, [winAmount]);

    useEffect(() => {
        clearTimeout(timerRef.current);

        const newWinAmount = finish?.winAmount ?? 0;
        const previousTotal = winAmount;

        if (newWinAmount > 0) {
            setWinAmount((prev) => {
                const accumulatedTotal = prev + newWinAmount;

                logger.logGameEvent('winning-amount-accumulation', {
                    newWinAmount,
                    accumulatedTotal,
                    previousTotal: prev,
                    roundId: finish?.roundId,
                    deviceInfo: {
                        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    }
                });

                return accumulatedTotal;
            });

            timerRef.current = setTimeout(() => {
                logger.logUIEvent('winning-amount-hidden', {
                    reason: 'timeout',
                    winAmount,
                    displayDuration: 3000,
                    deviceInfo: {
                        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    }
                });
                setWinAmount(0);
            }, 3000);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [finish]);

    if (!winAmount) {
        logger.logUIEvent('winning-amount-hidden', {
            reason: 'no-win-amount',
            winAmount: 0,
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            }
        });
        logger.endWorkflow('winning-amount-effect-init');
        return <div className="h-10"></div>;
    }

    const displayText = `${t("win")} ${numberWithCommas(winAmount, 2)}`;

    logger.logGameEvent('winning-amount-display', {
        winAmount,
        displayText,
        deviceInfo: {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            }
        }
    });

    logger.endWorkflow('winning-amount-effect-init');

    return (
        <div className="h-10 py-3 text-center text-[var(--color-winning-highlight)] text-lg font-bold uppercase md:text-xl">
            {displayText}
        </div>
    );
};

export default memo(WinningAmountEffect);
