import { Round } from "@shared";
import { useGameStore } from "@shared/stores";
import React, { useEffect, useRef, useState } from "react";
import RoundMultiplierItem from "./round-multiplier-item";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { logger } from "@plinko/services/logger";

export interface PlinkoRound extends Round {
    gameMode: number;
    numberOfRows: number;
}
const RoundMultiplierHistory = () => {
    logger.startWorkflow('round-multiplier-history-init', 'game-init', 'Initialize round multiplier history component');

    const roundHistory = useGameStore((state) => state.roundHistory);
    const finish = usePlinkoGameStore((state) => state.finishedBall);
    const [data, setData] = useState<PlinkoRound[]>([]);
    const isInitializedRef = useRef(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (finish) {
            const maxLength = 10;
            setIsAnimating(true);

            logger.logGameEvent('round-multiplier-new-finish', {
                roundId: finish.roundId,
                multiplier: finish.multiplier,
                winAmount: finish.winAmount,
                gameMode: finish.gameMode,
                numberOfRows: finish.numberOfRows,
                maxLength,
                currentDataLength: data.length,
                willAnimate: true,
                deviceInfo: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                }
            });

            setTimeout(() => {
                setData((prevData) => {
                    const newData = [...prevData, finish as PlinkoRound].slice(-maxLength);
                    logger.logGameEvent('round-multiplier-animation-complete', {
                        previousLength: prevData.length,
                        newLength: newData.length,
                        maxLength,
                        roundId: finish.roundId
                    });
                    return newData;
                });
                setIsAnimating(false);
            }, 200);
        }
    }, [finish, data.length]);

    useEffect(() => {
        if (roundHistory?.length && !isInitializedRef.current) {
            logger.logGameEvent('round-multiplier-history-initialized', {
                historyLength: roundHistory.length,
                sampleRound: roundHistory[0] ? {
                    roundId: roundHistory[0].roundId,
                    multiplier: roundHistory[0].multiplier,
                    gameMode: roundHistory[0].gameMode
                } : null,
                deviceInfo: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                }
            });

            setData(roundHistory.reverse() as PlinkoRound[]);
            isInitializedRef.current = true;
        }
    }, [roundHistory]);

    if (!data.length) {
        logger.logGameEvent('round-multiplier-no-data', {
            reason: 'empty data array',
            isInitialized: isInitializedRef.current,
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            }
        });
        logger.endWorkflow('round-multiplier-history-init');
        return null;
    }

    logger.logUIEvent('round-multiplier-history-render', {
        dataLength: data.length,
        isAnimating,
        maxWidth: '40rem',
        positioning: {
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
        },
        deviceInfo: {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            }
        }
    });

    logger.endWorkflow('round-multiplier-history-init');

    return (
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 round-multiplier-history flex justify-center max-w-[40rem] mx-auto">
            <div className="flex justify-end gap-1 overflow-x-auto ">
                {[...data].map((round, index) => (
                    <div key={index} className={`${isAnimating ? "animate-slide-to-left" : ""}`}>
                        <RoundMultiplierItem key={round.roundId} round={round as PlinkoRound} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoundMultiplierHistory;
