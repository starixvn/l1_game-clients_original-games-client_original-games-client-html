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
    const [initialBetAmount, setInitialBetAmount] = useState(0);
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
        const newInitialBetAmount = updateInitialBetAmount(isWin, isIncreaseOnWin, isIncreaseOnLoss);

        if (newInitialBetAmount) {
            setInitialBetAmount(newInitialBetAmount);
            return newInitialBetAmount;
        }

        const newBetAmount = Number((betAmount * (1 + percentage / 100)).toFixed(2));
        return Math.min(newBetAmount, maxBet);
    };

    useEffect(() => {
        if (!isAutoBet) {
            setInitialBetAmount(betAmount);
        }
    }, [betAmount, isAutoBet]);

    const updateInitialBetAmount = (isWin: boolean, isIncreaseOnWin: boolean, isIncreaseOnLoss: boolean) => {
        const betAmount = Math.min(initialBetAmount, maxBet);

        if (isWin) {
            if (!isIncreaseOnWin) {
                return betAmount;
            }
        } else {
            if (!isIncreaseOnLoss) {
                return betAmount;
            }
        }

        return null;
    };

    useEffect(() => {
        if (!finish) {
            return;
        }
        if (!isAutoBet) {
            return;
        }

        const isWin = finish.winAmount > finish.amount;
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
        const newBetAmount = getBetAmount(isWin);
        handleBetAmountChange(newBetAmount);

        if (newNumberOfBets <= 0) {
            setNumberOfBets(Infinity);
            setIsAutoBet(false);
        } else {
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
                    showAutoBetInstruction={() => setIsShowAutoBetInstruction(true)}
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
                    showAutoBetInstruction={() => setIsShowAutoBetInstruction(true)}
                />
            </div>
            <div>
                <StopOnControl title={t("stop_on_win")} value={stopOnWin} setValue={setStopOnWin} isDisabled={isDisabled} />
            </div>
            <div>
                <StopOnControl title={t("stop_on_loss")} value={stopOnLoss} setValue={setStopOnLoss} isDisabled={isDisabled} />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <i className="icon icon-guide text-xl before:text-[#9C9C9C] before:content-['\e90a']" />
                    <span className="text-sm md:text-base font-semibold text-[#9C9C9C]">{t("how_to_use_auto_bet")}</span>
                </div>
                {isShowAutoBetInstruction && <AutoBetInstruction setIsShowAutoBetInstruction={setIsShowAutoBetInstruction} />}
            </div>
        </div>
    );
};

export default memo(AutoBetGroup);
