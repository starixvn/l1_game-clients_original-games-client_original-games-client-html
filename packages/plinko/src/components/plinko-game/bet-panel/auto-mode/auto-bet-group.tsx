import { memo, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/shallow";
import { ResourceTypes, useClientSeedPF, useGameStore } from "@shared";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { PercentageControl, StopOnControl, NumberOfBetsControl } from "../form-components";
import { useTranslate } from "@tolgee/react";

const AutoBetInstruction = dynamic(() => import("./auto-bet-instruction"), { ssr: false });

const AutoBetGroup = ({
    isDisabled,
    isAutoBet,
    setIsAutoBet,
    handleBetAmountChange,
    maxBet,
}: {
    isDisabled: boolean;
    isAutoBet: boolean;
    setIsAutoBet: (isAutoBet: boolean) => void;
    handleBetAmountChange: (amount: number) => void;
    maxBet: number;
}) => {
    const [numberOfBets, setNumberOfBets] = useState(Infinity);
    const [isIncreaseOnWin, setIsIncreaseOnWin] = useState(false);
    const [onWinPercentage, setOnWinPercentage] = useState(0);
    const [isIncreaseOnLoss, setIsIncreaseOnLoss] = useState(false);
    const [onLossPercentage, setOnLossPercentage] = useState(0);
    const [stopOnWin, setStopOnWin] = useState(0);
    const [stopOnLoss, setStopOnLoss] = useState(0);
    const [totalNetProfit, setTotalNetProfit] = useState(0);
    const [isShowAutoBetInstruction, setIsShowAutoBetInstruction] = useState(false);
    const { t } = useTranslate(ResourceTypes.COMMON);
    const socket = useGameStore((state) => state.socket);
    const { clientSeed } = useClientSeedPF();
    const { betAmount, gameMode, numberOfRows, finish } = usePlinkoGameStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
            gameMode: state.gameMode,
            numberOfRows: state.numberOfRows,
            finish: state.finish,
        }))
    );
    const handleBetClick = useCallback(
        (amount: number) => {
            if (socket?.connected) {
                socket.emit("bet", { amount, gameMode, numberOfRows, clientSeed });
            }
        },
        [socket, gameMode, numberOfRows, clientSeed]
    );

    const isReachStopCondition = (profit: number) => {
        return (stopOnWin > 0 && profit >= stopOnWin) || (stopOnLoss > 0 && -profit >= stopOnLoss);
    };

    const getBetAmount = (isWin: boolean) => {
        const percentage = isWin ? onWinPercentage : onLossPercentage;
        const newBetAmount = Number((betAmount * (1 + percentage / 100)).toFixed(2));
        return Math.min(newBetAmount, maxBet);
    };

    useEffect(() => {
        if (!finish) {
            return;
        }
        if (!isAutoBet) {
            return;
        }
        const newTotalNetProfit = Number((totalNetProfit + finish.winAmount - finish.amount).toFixed(2));
        if (isReachStopCondition(newTotalNetProfit)) {
            setIsAutoBet(false);
            return;
        }
        setTotalNetProfit(newTotalNetProfit);
        const newNumberOfBets = numberOfBets - 1;
        setNumberOfBets(newNumberOfBets);
        // Note: Ball spawning is controlled by MIN_SPAWN_INTERVAL_AUTO_BET (1500ms) in ball-constants.ts
        // This prevents physics engine overload during rapid auto-betting
        if (newNumberOfBets <= 0) {
            setNumberOfBets(Infinity);
            setIsAutoBet(false);
        } else {
            const newBetAmount = getBetAmount(finish.winAmount > finish.amount);
            handleBetAmountChange(newBetAmount);
            handleBetClick(newBetAmount);
        }
    }, [finish]);

    useEffect(() => {
        if (!isAutoBet) {
            setTotalNetProfit(0);
        }
    }, [isAutoBet]);

    return (
        <div className="flex flex-col gap-4">
            <div>
                <NumberOfBetsControl numberOfBets={numberOfBets} setNumberOfBets={setNumberOfBets} isDisabled={isDisabled} />
            </div>
            <div>
                <PercentageControl
                    title={t("on_win")}
                    isIncreaseOn={isIncreaseOnWin}
                    setIsIncreaseOn={setIsIncreaseOnWin}
                    percentage={onWinPercentage}
                    setPercentage={setOnWinPercentage}
                    isDisabled={isDisabled}
                />
            </div>
            <div>
                <PercentageControl
                    title={t("on_loss")}
                    isIncreaseOn={isIncreaseOnLoss}
                    setIsIncreaseOn={setIsIncreaseOnLoss}
                    percentage={onLossPercentage}
                    setPercentage={setOnLossPercentage}
                    isDisabled={isDisabled}
                />
            </div>
            <div>
                <StopOnControl title={t("stop_on_win")} value={stopOnWin} setValue={setStopOnWin} isDisabled={isDisabled} />
            </div>
            <div>
                <StopOnControl title={t("stop_on_loss")} value={stopOnLoss} setValue={setStopOnLoss} isDisabled={isDisabled} />
            </div>
            <div>
                <div onClick={() => setIsShowAutoBetInstruction(true)} className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm md:text-base font-semibold">{t("how_to_use_auto_bet")}</span>
                    <i className="icon icon-back text-xl scale-x-[-1]" />
                </div>
                {isShowAutoBetInstruction && <AutoBetInstruction setIsShowAutoBetInstruction={setIsShowAutoBetInstruction} />}
            </div>
        </div>
    );
};

export default memo(AutoBetGroup);
