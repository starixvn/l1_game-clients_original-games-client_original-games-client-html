import { render } from "@testing-library/react";
import React from "react";

import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameStateContextModel } from "../../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../../game-base/type";
import CountdownTimer, { RoundBaseStatus, SimpleTimer } from "../countdown-timer";

const mockUseGameStateContext = useGameStateContext as jest.Mock;

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
}));

jest.mock("../../../../_shared/react-hooks/use-translator", () => ({
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useState: (initialValue) => [initialValue, jest.fn()],
}));

describe("CountdownTimer File", () => {
    describe("CountdownTimer Component", () => {
        const MockSimpleTimer = () => <div className="simple-timer"></div>;
        const MockGameStatus = ({ children }) => <div className="game-status">{children}</div>;

        test("renders SimpleTimer and GameStatus for InRound state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.InRound } as GameStateContextModel);

            const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} />);

            expect(container.querySelector(".simple-timer")).toBeInTheDocument();
            expect(container.querySelector(".start-betting")).toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).not.toBeInTheDocument();
            expect(container.querySelector(".game-status")).toBeInTheDocument();
        });

        test("renders SimpleTimer and GameStatus for LockingBet state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.LockingBet } as GameStateContextModel);

            const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} />);

            expect(container.querySelector(".simple-timer")).toBeInTheDocument();
            expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).not.toBeInTheDocument();
            expect(container.querySelector(".game-status")).toBeInTheDocument();
        });

        test("only renders loading show result and GameStatus for DisplayResult state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.DisplayResult } as GameStateContextModel);

            const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} />);

            expect(container.querySelector(".simple-timer")).not.toBeInTheDocument();
            expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).toBeInTheDocument();
            expect(container.querySelector(".game-status")).toBeInTheDocument();
        });

        test("only renders loading show result for None state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.None } as GameStateContextModel);

            const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} />);

            expect(container.querySelector(".simple-timer")).not.toBeInTheDocument();
            expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).toBeInTheDocument();
            expect(container.querySelector(".game-status")).not.toBeInTheDocument();
        });

        test.each([RoundState.BeforePlaceBet, RoundState.SwitchRound, RoundState.ConnectFailed, RoundState.Disabled, 9])(
            "renders nothing for BeforePlaceBet or SwitchRound or ConnectFailed or Disabled state or wrong state",
            (roundState) => {
                mockUseGameStateContext.mockReturnValue({ roundState } as GameStateContextModel);

                const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} />);

                expect(container.querySelector(".simple-timer")).not.toBeInTheDocument();
                expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
                expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
                expect(container.querySelector(".status_result")).not.toBeInTheDocument();
                expect(container.querySelector(".loader-show-result")).not.toBeInTheDocument();
                expect(container.querySelector(".game-status")).not.toBeInTheDocument();
            }
        );
    });

    describe("SimpleTimer Component", () => {
        test("renders nothing when remainingTime is 0 or less", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.BeforePlaceBet } as GameStateContextModel);

            const { container } = render(<SimpleTimer clientRemainingTime={0} />);

            expect(container.querySelector(".countdown-timer")).not.toBeInTheDocument();
        });

        test.each([
            [RoundState.InRound, 4, 0, "04"],
            [RoundState.LockingBet, 3, 1, "03"],
        ])(
            "renders timer with correct classes and formatted time when remainingTime > 0",
            (roundState, remainingTime, expectedLockBetClassLength, expectedTextContent) => {
                mockUseGameStateContext.mockReturnValue({ roundState } as GameStateContextModel);

                const simpleTimer = render(<SimpleTimer clientRemainingTime={remainingTime} />);

                expect(simpleTimer.container.querySelector(".timer")).toBeInTheDocument();
                expect(simpleTimer.container.querySelector(".countdown-timer")).toBeInTheDocument();
                expect(simpleTimer.container.querySelectorAll(".lock-bet").length).toBe(expectedLockBetClassLength);
                expect(simpleTimer.container.querySelector(".countdown-timer").textContent).toBe(expectedTextContent);
            }
        );
    });

    describe("GameStatus Component", () => {
        const MockGameStatusChildren = () => <div>test</div>;
        test("renders children content", () => {
            const childContent = "Test Child Content";
            const screen = render(<RoundBaseStatus>{childContent}</RoundBaseStatus>);
            expect(screen.getByText(childContent)).toBeInTheDocument();
        });
    });
});
