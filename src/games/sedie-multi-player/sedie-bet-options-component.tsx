import React from "react";
import { SeDieBetOptions, SeDieChoices, mainChoices, topChoices, bottomChoices, ChoiceSeDieIconMapper } from "./sedie-constants";
import Styles from "./sedie-multi-player.module.scss";

interface SeDieBetOptionsComponentProps {
    selectedChoice: string;
    onChoiceSelect: (choice: string) => void;
    onBet: () => void;
    isDisabled: boolean;
    odds: (choice: string) => number;
}

const SeDieBetOptionsComponent: React.FC<SeDieBetOptionsComponentProps> = ({
    selectedChoice,
    onChoiceSelect,
    onBet,
    isDisabled,
    odds,
}) => {
    const renderMainOption = (choice: string, name: string) => {
        const isSelected = selectedChoice === choice;
        const isDisabledChoice = isDisabled;
        const oddValue = odds(choice);

        return (
            <div
                key={choice}
                className={`${Styles["bet-choice"]} ${Styles["main-option"]} ${isSelected ? Styles["selected"] : ""
                    } ${isDisabledChoice ? Styles["disabled"] : ""}`}
                onClick={() => !isDisabledChoice && onChoiceSelect(choice)}
            >
                <div className={Styles["bg-bet-option"]}>
                    <div className={Styles["btn-ripple"]}>
                        <div className={Styles["choice-content"]}>
                            <div className={Styles["choice-name"]}>{name}</div>
                            <div className={Styles["choice-odds"]}>{oddValue}x</div>
                        </div>
                    </div>
                    {isDisabledChoice && <div className={Styles["disable-layer"]}></div>}
                </div>
            </div>
        );
    };

    const renderSubOption = (choice: string, name: string) => {
        const isSelected = selectedChoice === choice;
        const isDisabledChoice = isDisabled;
        const oddValue = odds(choice);
        const dots = ChoiceSeDieIconMapper[choice] || [];

        return (
            <div
                key={choice}
                className={`${Styles["bet-choice"]} ${Styles["sub-option"]} ${isSelected ? Styles["selected"] : ""
                    } ${isDisabledChoice ? Styles["disabled"] : ""}`}
                onClick={() => !isDisabledChoice && onChoiceSelect(choice)}
            >
                <div className={Styles["bg-bet-option"]}>
                    <div className={Styles["btn-ripple"]}>
                        <div className={Styles["choice-content"]}>
                            <div className={Styles["dots-container"]}>
                                {dots.map((isRed, index) => (
                                    <div
                                        key={index}
                                        className={`${Styles["dot"]} ${isRed ? Styles["red-dot"] : Styles["white-dot"]
                                            }`}
                                    ></div>
                                ))}
                            </div>
                            <div className={Styles["choice-odds"]}>{oddValue}x</div>
                        </div>
                    </div>
                    {isDisabledChoice && <div className={Styles["disable-layer"]}></div>}
                </div>
            </div>
        );
    };

    return (
        <div className={Styles["bet-options-container"]}>
            {/* Main Options - Odd/Even */}
            <div className={Styles["main-betting-zone"]}>
                <div className={Styles["main-options"]}>
                    {renderMainOption(SeDieBetOptions.ODD, "Odd")}
                    {renderMainOption(SeDieBetOptions.EVEN, "Even")}
                </div>
            </div>

            {/* Sub Options - Red/White combinations */}
            <div className={Styles["sub-betting-zone"]}>
                <div className={Styles["top-options"]}>
                    {topChoices.map((choice) => renderSubOption(choice, choice.toUpperCase()))}
                </div>
                <div className={Styles["bottom-options"]}>
                    {bottomChoices.map((choice) => renderSubOption(choice, choice.toUpperCase()))}
                </div>
            </div>
        </div>
    );
};

export default SeDieBetOptionsComponent;
