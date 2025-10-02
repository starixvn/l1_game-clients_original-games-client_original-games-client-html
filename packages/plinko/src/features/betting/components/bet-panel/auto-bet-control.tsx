import { useState } from "react";
import { PercentageControl } from "./components/percentage-control";
import { Label } from "./components/label";

const BUTTONS_NUMBER_OF_BETS = [
    { text: "∞", value: Infinity },
    { text: "10", value: 10 },
    { text: "100", value: 100 },
];

const AutoBetControl = () => {
    const [numberOfBets, setNumberOfBets] = useState(100);
    const [isIncreaseOnWin, setIsIncreaseOnWin] = useState(false);
    const [onWinPercentage, setOnWinPercentage] = useState(0);
    const [isIncreaseOnLoss, setIsIncreaseOnLoss] = useState(false);
    const [onLossPercentage, setOnLossPercentage] = useState(0);
    const [stopOnWin, setStopOnWin] = useState(0);
    const [stopOnLoss, setStopOnLoss] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Label title="Number of Bets" />
                <div className="relative">
                    <input
                        type="number"
                        step={1}
                        pattern="[0-9]*"
                        value={numberOfBets}
                        onChange={(e) => setNumberOfBets(parseInt(e.target.value))}
                        onFocus={() => (numberOfBets === Infinity ? setNumberOfBets(0) : setNumberOfBets(numberOfBets))}
                        onBlur={() => setNumberOfBets(numberOfBets === 0 ? Infinity : numberOfBets)}
                        inputMode="numeric"
                        className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                    />
                    {numberOfBets === Infinity && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white">∞</span>}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                        {BUTTONS_NUMBER_OF_BETS.map((button, index) => (
                            <button
                                className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg"
                                onClick={() => setNumberOfBets(button.value)}
                                key={index}
                            >
                                {button.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <Label title="On Win" />
                <PercentageControl
                    isIncreaseOn={isIncreaseOnWin}
                    setIsIncreaseOn={setIsIncreaseOnWin}
                    percentage={onWinPercentage}
                    setPercentage={setOnWinPercentage}
                />
            </div>
            <div>
                <Label title="On Loss" />
                <PercentageControl
                    isIncreaseOn={isIncreaseOnLoss}
                    setIsIncreaseOn={setIsIncreaseOnLoss}
                    percentage={onLossPercentage}
                    setPercentage={setOnLossPercentage}
                />
            </div>
            <div>
                <Label title="Stop On Win" />
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={stopOnWin}
                    onChange={(e) => setStopOnWin(Number((+e.target.value).toFixed(2)))}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                />
            </div>
            <div>
                <Label title="Stop On Loss" />
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={stopOnLoss}
                    onChange={(e) => setStopOnLoss(Number((+e.target.value).toFixed(2)))}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                />
            </div>
        </div>
    );
};

export default AutoBetControl;
