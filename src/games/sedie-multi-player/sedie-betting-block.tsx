import React, { useState } from "react";
import { RoundState } from "../../components/game-base/type";
import { SeDieBetOptions, SeDieChoices, mainChoices, topChoices, bottomChoices } from "./sedie-constants";
import SeDieBetOptionsComponent from "./sedie-bet-options-component";
import Styles from "./sedie-multi-player.module.scss";

interface SeDieBettingBlockProps {
    onBet: (betChoice: string, amount: number, freeBet?: boolean) => void;
    roundState: RoundState;
    userStakeLevel?: number;
}

const SeDieBettingBlock: React.FC<SeDieBettingBlockProps> = ({
    onBet,
    roundState,
    userStakeLevel = 100,
}) => {
    const [selectedChoice, setSelectedChoice] = useState<string>("");
    const [betAmount, setBetAmount] = useState<number>(userStakeLevel);
    const [isFreeBet, setIsFreeBet] = useState<boolean>(false);

    const isBettingDisabled = roundState !== RoundState.PlacingBet;

    const handleChoiceSelect = (choice: string) => {
        if (!isBettingDisabled) {
            setSelectedChoice(choice);
        }
    };

    const handleBetAmountChange = (amount: number) => {
        setBetAmount(amount);
    };

    const handleFreeBetToggle = () => {
        setIsFreeBet(!isFreeBet);
    };

    const handlePlaceBet = () => {
        if (selectedChoice && betAmount > 0 && !isBettingDisabled) {
            onBet(selectedChoice, betAmount, isFreeBet);
            setSelectedChoice("");
        }
    };

    const getOdds = (choice: string): number => {
        // Mock odds - in real implementation these would come from the game service
        const oddsMap: Record<string, number> = {
            [SeDieBetOptions.ODD]: 1.95,
            [SeDieBetOptions.EVEN]: 1.95,
            [SeDieBetOptions.RED2]: 3.8,
            [SeDieBetOptions.RED3]: 3.8,
            [SeDieBetOptions.RED4]: 15.2,
            [SeDieBetOptions.WHITE3]: 3.8,
            [SeDieBetOptions.WHITE4]: 15.2,
        };
        return oddsMap[choice] || 1.0;
    };

    return (
        <div className={Styles["betting-zone"]}>
            <div className={Styles["betting-header"]}>
                <h3>Place Your Bets</h3>
                <div className={Styles["betting-controls"]}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isFreeBet}
                            onChange={handleFreeBetToggle}
                            disabled={isBettingDisabled}
                        />
                        Free Bet
                    </label>
                    <div className={Styles["bet-amount-control"]}>
                        <label>Bet Amount:</label>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => handleBetAmountChange(Number(e.target.value))}
                            min={1}
                            disabled={isBettingDisabled}
                        />
                    </div>
                </div>
            </div>

            <SeDieBetOptionsComponent
                selectedChoice={selectedChoice}
                onChoiceSelect={handleChoiceSelect}
                onBet={handlePlaceBet}
                isDisabled={isBettingDisabled}
                odds={getOdds}
            />

            {selectedChoice && (
                <div className={Styles["bet-summary"]}>
                    <div className={Styles["selected-choice"]}>
                        <span>Selected: {selectedChoice}</span>
                        <span>Odds: {getOdds(selectedChoice)}x</span>
                        <span>Amount: {betAmount}</span>
                        {isFreeBet && <span className={Styles["free-bet-badge"]}>Free Bet</span>}
                    </div>
                    <button
                        className={Styles["place-bet-button"]}
                        onClick={handlePlaceBet}
                        disabled={isBettingDisabled}
                    >
                        Place Bet
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeDieBettingBlock;
