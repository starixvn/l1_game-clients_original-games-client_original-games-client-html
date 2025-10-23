import { memo, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { ResourceTypes, useClientSeedPF, useGameStore } from "@shared";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { PercentageControl, StopOnControl, NumberOfBetsControl } from "../form-components";
import { useTranslate } from "@tolgee/react";
import { StorageHelper } from "@shared/helpers";
import { PLINKO_STORAGE_KEYS } from "@plinko/constants";

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
    const [numberOfBets, setNumberOfBets] = useState<number>(() => {
        const oldValue = StorageHelper.get<number>(PLINKO_STORAGE_KEYS.NUMBER_OF_BETS);
        if (oldValue === 0) {
            return Infinity;
        } else {
            return oldValue ?? 10;
        }
    });
    const [isIncreaseOnWin, setIsIncreaseOnWin] = useState(false);
    const [onWinPercentage, setOnWinPercentage] = useState(0);
    const [isIncreaseOnLoss, setIsIncreaseOnLoss] = useState(false);
    const [onLossPercentage, setOnLossPercentage] = useState(0);
    const [stopOnWin, setStopOnWin] = useState(0);
    const [stopOnLoss, setStopOnLoss] = useState(0);
    const [totalNetProfit, setTotalNetProfit] = useState(0);
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
        // Note: Ball spawning is controlled by MIN_SPAWN_INTERVAL_AUTO_BET (1500ms) in ball-constants.ts
        // This prevents physics engine overload during rapid auto-betting
        const newBetAmount = getBetAmount(isWin);
        handleBetAmountChange(newBetAmount);

        const newNumberOfBets = numberOfBets - 1;
        setNumberOfBets(newNumberOfBets);
        if (newNumberOfBets > 0) {
            const ms = newBetAmount === 0 ? Math.floor(Math.random() * 101) + 500 : 0; // NOSONAR
            setTimeout(() => handleBetClick(newBetAmount), ms);
        } else {
            const oldValue = StorageHelper.get<number>(PLINKO_STORAGE_KEYS.NUMBER_OF_BETS);
            if (oldValue === 0) {
                setNumberOfBets(Infinity);
            } else {
                setNumberOfBets(oldValue ?? 10);
            }
            setIsAutoBet(false);
        }
    }, [finish]);

    useEffect(() => {
        if (!isAutoBet) {
            setTotalNetProfit(0);
        }
    }, [isAutoBet]);

    const handleSetNumberOfBets = (numberOfBets: number) => {
        setNumberOfBets(numberOfBets);
        if (numberOfBets === Infinity) {
            StorageHelper.set(PLINKO_STORAGE_KEYS.NUMBER_OF_BETS, 0);
        } else {
            StorageHelper.set(PLINKO_STORAGE_KEYS.NUMBER_OF_BETS, numberOfBets);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <NumberOfBetsControl
                    numberOfBets={numberOfBets}
                    setNumberOfBets={handleSetNumberOfBets}
                    isDisabled={isDisabled && isAutoBet}
                />
            </div>
            <div>
                <PercentageControl
                    title={t("on_win")}
                    isIncreaseOn={isIncreaseOnWin}
                    setIsIncreaseOn={setIsIncreaseOnWin}
                    percentage={onWinPercentage}
                    setPercentage={setOnWinPercentage}
                    isDisabled={isDisabled}
                    type="on_win"
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
                    type="on_loss"
                />
            </div>
            <div>
                <StopOnControl title={t("stop_on_win")} value={stopOnWin} setValue={setStopOnWin} isDisabled={isDisabled} />
            </div>
            <div>
                <StopOnControl title={t("stop_on_loss")} value={stopOnLoss} setValue={setStopOnLoss} isDisabled={isDisabled} />
            </div>
            <div>
                <div className="flex items-start gap-2">
                    <i className="icon icon-guide text-xl before:text-[#9C9C9C] before:content-['\e90a']" />
                    <span className="text-sm font-semibold text-[#9C9C9C]">{t("auto_bet_warning")}</span>
                </div>
            </div>
        </div>
    );
};

export default memo(AutoBetGroup);
