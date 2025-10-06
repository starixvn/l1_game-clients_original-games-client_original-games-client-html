import { memo, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useClientSeedPF, useGameStore } from "@shared";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { PercentageControl, StopOnControl, NumberOfBetsControl } from "./form-components";

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

    const { socket, endBet } = useGameStore(
        useShallow((state) => ({
            socket: state.socket,
            endBet: state.endBet,
        }))
    );
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

    useEffect(() => {
        if (endBet < 0) {
            setIsAutoBet(false);
        }
    }, [endBet]);

    return (
        <div className="flex flex-col gap-4">
            <div>
                <NumberOfBetsControl numberOfBets={numberOfBets} setNumberOfBets={setNumberOfBets} isDisabled={isDisabled} />
            </div>
            <div>
                <PercentageControl
                    title="On Win"
                    isIncreaseOn={isIncreaseOnWin}
                    setIsIncreaseOn={setIsIncreaseOnWin}
                    percentage={onWinPercentage}
                    setPercentage={setOnWinPercentage}
                    isDisabled={isDisabled}
                />
            </div>
            <div>
                <PercentageControl
                    title="On Loss"
                    isIncreaseOn={isIncreaseOnLoss}
                    setIsIncreaseOn={setIsIncreaseOnLoss}
                    percentage={onLossPercentage}
                    setPercentage={setOnLossPercentage}
                    isDisabled={isDisabled}
                />
            </div>
            <div>
                <StopOnControl title="Stop On Win" value={stopOnWin} setValue={setStopOnWin} isDisabled={isDisabled} />
            </div>
            <div>
                <StopOnControl title="Stop On Loss" value={stopOnLoss} setValue={setStopOnLoss} isDisabled={isDisabled} />
            </div>
        </div>
    );
};

export default memo(AutoBetGroup);
