import { memo } from "react";
import Label from "./label";
import { ResourceTypes } from "@shared/resources";
import { useTranslate } from "@tolgee/react";

const BUTTONS_NUMBER_OF_BETS = [
    { text: "∞", value: Infinity },
    { text: "10", value: 10 },
    { text: "100", value: 100 },
];

const NumberOfBetsControl = ({
    numberOfBets,
    setNumberOfBets,
    isDisabled,
}: {
    numberOfBets: number;
    setNumberOfBets: (numberOfBets: number) => void;
    isDisabled: boolean;
}) => {
    const {t} = useTranslate(ResourceTypes.COMMON);

    return (
        <div>
            <Label title={t("number_of_bet")} />
            <div className="relative">
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={numberOfBets}
                    onChange={(e) => setNumberOfBets(Math.min(parseInt(e.target.value), 99999999))}
                    onFocus={() => (numberOfBets === Infinity ? setNumberOfBets(0) : setNumberOfBets(numberOfBets))}
                    onBlur={() => setNumberOfBets(!numberOfBets ? Infinity : numberOfBets)}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11 disabled:opacity-50"
                    disabled={isDisabled}
                />
                {numberOfBets === Infinity && (
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white ${isDisabled ? "opacity-50" : ""}`}>
                        ∞
                    </span>
                )}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    {BUTTONS_NUMBER_OF_BETS.map((button, index) => (
                        <button
                            className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg disabled:opacity-50 hover:scale-105 transition-all duration-200"
                            onClick={() => setNumberOfBets(button.value)}
                            key={index}
                            disabled={isDisabled}
                        >
                            {button.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default memo(NumberOfBetsControl);
