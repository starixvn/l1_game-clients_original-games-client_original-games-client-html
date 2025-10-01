import { useState } from "react";
import PercentageControl from "../controls/percentage-control";

const AutoBetControl = () => {
    const [numberOfBets, setNumberOfBets] = useState(100);
    const [isIncreaseOnWin, setIsIncreaseOnWin] = useState(false);
    const [onWinPercentage, setOnWinPercentage] = useState(0);
    const [isIncreaseOnLoss, setIsIncreaseOnLoss] = useState(false);
    const [onLossPercentage, setOnLossPercentage] = useState(0);
    const [stopOnWin, setStopOnWin] = useState(100);
    const [stopOnLoss, setStopOnLoss] = useState(100);

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="text-sm md:text-base mb-2 font-semibold">Number of Bets</div>
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
                        <button className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg" onClick={() => setNumberOfBets(Infinity)}>
                            ∞
                        </button>
                        <button className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg" onClick={() => setNumberOfBets(10)}>
                            10
                        </button>
                        <button className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg" onClick={() => setNumberOfBets(100)}>
                            100
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div className="text-sm md:text-base mb-2 font-semibold">On Win</div>
                <PercentageControl
                    isIncreaseOn={isIncreaseOnWin}
                    setIsIncreaseOn={setIsIncreaseOnWin}
                    percentage={onWinPercentage}
                    setPercentage={setOnWinPercentage}
                />
            </div>
            <div>
                <div className="text-sm md:text-base mb-2 font-semibold">On Loss</div>
                <PercentageControl
                    isIncreaseOn={isIncreaseOnLoss}
                    setIsIncreaseOn={setIsIncreaseOnLoss}
                    percentage={onLossPercentage}
                    setPercentage={setOnLossPercentage}
                />
            </div>
            <div>
                <div className="text-sm md:text-base mb-2 font-semibold">Stop On Win</div>
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={stopOnWin}
                    onChange={(e) => setStopOnWin(parseInt(e.target.value))}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                />
            </div>
            <div>
                <div className="text-sm md:text-base mb-2 font-semibold">Stop On Loss</div>
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={stopOnLoss}
                    onChange={(e) => setStopOnLoss(parseInt(e.target.value))}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                />
            </div>
        </div>
    );
};

export default AutoBetControl;
