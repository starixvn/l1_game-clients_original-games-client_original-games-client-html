import React from "react";
import { render, waitFor } from "@testing-library/react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Odds from "./odds";

jest.mock("../../../_shared/helpers", () => ({ formatOdds: jest.fn((value, format) => `${value}`) }));
jest.mock("../../../_shared/react-contexts", () => ({ usePlayerContext: jest.fn().mockReturnValue({ fractionalOddsFormat: false }) }));
jest.mock("../../../_shared/react-contexts/game-state-context/game-state-context", () => ({ useGameStateContext: jest.fn() }));

describe(Odds.name, () => {
    const choice = "choice1";
    it("should render match the snapshot when round state = in round", () => {
        // arrange
        (useGameStateContext as jest.Mock).mockReturnValue({
            gameConfigs: { odds: { [choice]: 1.96 } },
            roundState: RoundState.InRound,
        });

        // act
        const { container } = render(
            <Odds choice={choice} className="custom-class" animationDuration={1} tolgeeNamespace="gameA" />
        );

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("1.96");
    });

    it("should render empty when exist odds", () => {
        // arrange
        (useGameStateContext as jest.Mock).mockReturnValue({
            gameConfigs: {},
            roundState: RoundState.InRound,
        });

        // act
        const { container } = render(
            <Odds choice={choice} className="custom-class" animationDuration={1} tolgeeNamespace="gameA" />
        );

        // assert
        expect(container.innerHTML).toBe("");
    });

    it("should render icon when odds change", () => {
        // arrange
        const gameState = {
            gameConfigs: { odds: { [choice]: 1.96 } },
            roundState: RoundState.DisplayResult,
        };
        (useGameStateContext as jest.Mock).mockImplementation(() => {
            return gameState;
        });
        const { container } = render(
            <Odds choice={choice} className="custom-class" animationDuration={1} tolgeeNamespace="gameA" />
        );

        // act
        gameState.gameConfigs.odds[choice] = 2.01;
        gameState.roundState = RoundState.InRound;

        // assert
        waitFor(() => {
            expect(container.children[0].className).toBe("text-center bet-odds custom-class up show-odds-icon");
            expect(container.innerHTML).toBe("2.01");
        });
    });
});
