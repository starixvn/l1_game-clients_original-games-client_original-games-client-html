import { render, screen, act } from "@testing-library/react";
import { useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import BetHistoryBase from "../bet-history-base";
import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../../_shared/helpers";
import { useGameContext } from "../../../../_shared/react-contexts";
import { randomBytes } from "crypto";

const mockDispatch = useGameStatesDispatch as jest.Mock;
const mockSortedCollectionByTime = sortedCollectionByTime as jest.Mock;
const mockNumberWithCommas = numberWithCommas as jest.Mock;
const mockSeparateDateTime = separateDateTime as jest.Mock;
const mockGameContext = useGameContext as jest.Mock;

String.prototype.capitalizeFirstLetter = function () {
    return this;
};

jest.mock("../../infinite-table", () => {
    const InfiniteTable = ({ addData, body }) => (
        <>
            <div data-testid="infinite-table">InfiniteTable</div>
            <button onClick={addData} data-testid="add-data"></button>
            <table>
                {body.map((row) => (
                    <tbody key={randomBytes(16).toString("hex")}>
                        {row.map((item) => (
                            <tr key={randomBytes(10).toString()}>
                                <td>{item.node}</td>
                            </tr>
                        ))}
                    </tbody>
                ))}
            </table>
        </>
    );
    return { InfiniteTable };
});

jest.mock("../../../../_shared/react-contexts", () => ({
    useGameContext: jest.fn(),
}));

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStatesDispatch: jest.fn(),
    useGameStateContext: jest.fn(),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useClickSound: jest.fn().mockReturnValue(jest.fn()),
    useCommonTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("../../../../_shared/helpers", () => ({
    numberWithCommas: jest.fn(),
    separateDateTime: jest.fn(),
    sortedCollectionByTime: jest.fn(),
}));

beforeAll(() => {
    mockNumberWithCommas.mockImplementation((x) => x);
    mockSeparateDateTime.mockImplementation((x) => x);
    mockSortedCollectionByTime.mockImplementation((x) => x);
});

describe(BetHistoryBase.name, () => {
    describe("render", () => {
        describe("when init", () => {
            it("should call broadcastGameEvent", () => {
                mockDispatch.mockReturnValue(jest.fn());
                const gameMessageHandler = {
                    broadcastGameEvent: jest.fn(),
                    register: jest.fn(),
                    removeHandler: jest.fn(),
                };
                mockGameContext.mockReturnValue({ gameMessageHandler });

                render(<BetHistoryBase isTurnBase={true} renderBetLogResult={jest.fn()} />);

                expect(gameMessageHandler.broadcastGameEvent).toHaveBeenCalled();
            });
        });
        describe("when got data", () => {
            it("should render bet log result", () => {
                mockDispatch.mockReturnValue(jest.fn());
                let mockCallback = jest.fn();
                const gameMessageHandler = {
                    broadcastGameEvent: jest.fn(),
                    register: (_, callback) => {
                        mockCallback = callback;
                    },
                    removeHandler: jest.fn(),
                };
                mockGameContext.mockReturnValue({ gameMessageHandler });
                const mockRenderBetLogResult = jest.fn();
                mockRenderBetLogResult.mockReturnValue(<div></div>);

                const betHistoryBase = <BetHistoryBase isTurnBase={true} renderBetLogResult={mockRenderBetLogResult} />;
                const renderResult = render(betHistoryBase);
                act(() => {
                    mockCallback({
                        history: {
                            betLogs: [
                                {
                                    drawId: 1234,
                                    time: new Date(),
                                    result: {},
                                    totalAmount: 1,
                                    betwin: 1,
                                },
                            ],
                        },
                    });
                });
                renderResult.rerender(betHistoryBase);

                expect(mockRenderBetLogResult).toHaveBeenCalled();
            });
        });
        describe("when got data empty", () => {
            it("should not render bet log result", () => {
                mockDispatch.mockReturnValue(jest.fn());
                let mockCallback = jest.fn();
                const gameMessageHandler = {
                    broadcastGameEvent: jest.fn(),
                    register: (_, callback) => {
                        mockCallback = callback;
                    },
                    removeHandler: jest.fn(),
                };
                mockGameContext.mockReturnValue({ gameMessageHandler });
                const mockRenderBetLogResult = jest.fn();
                mockRenderBetLogResult.mockReturnValue(<div></div>);

                const betHistoryBase = <BetHistoryBase isTurnBase={true} renderBetLogResult={mockRenderBetLogResult} />;
                const renderResult = render(betHistoryBase);
                act(() => {
                    mockCallback({
                        history: {
                            betLogs: [],
                        },
                    });
                });
                renderResult.rerender(betHistoryBase);

                expect(mockRenderBetLogResult).toHaveBeenCalledTimes(0);
            });
        });
    });

    describe("click draw id", () => {
        it("should call dispatch", () => {
            mockDispatch.mockReturnValue(jest.fn());
            let mockCallback = jest.fn();
            const gameMessageHandler = {
                broadcastGameEvent: jest.fn(),
                register: (_, callback) => {
                    mockCallback = callback;
                },
                removeHandler: jest.fn(),
            };
            mockGameContext.mockReturnValue({ gameMessageHandler });
            const mockRenderBetLogResult = jest.fn();
            mockRenderBetLogResult.mockReturnValue(<div></div>);
            mockDispatch.mockReturnValue(jest.fn());

            const betHistoryBase = <BetHistoryBase isTurnBase={true} renderBetLogResult={mockRenderBetLogResult} />;
            const renderResult = render(betHistoryBase);
            act(() => {
                mockCallback({
                    history: {
                        betLogs: [
                            {
                                drawId: 1234,
                                time: new Date(),
                                result: {},
                                totalAmount: 1,
                                betwin: 1,
                            },
                        ],
                    },
                });
            });
            renderResult.rerender(betHistoryBase);
            screen.getByText("1234").click();

            expect(mockDispatch).toHaveBeenCalled();
        });
    });

    describe("when add data", () => {
        it("should broadcast message", () => {
            mockDispatch.mockReturnValue(jest.fn());
            let mockCallback = jest.fn();
            const gameMessageHandler = {
                broadcastGameEvent: jest.fn(),
                register: (_, callback) => {
                    mockCallback = callback;
                },
                removeHandler: jest.fn(),
            };
            mockGameContext.mockReturnValue({ gameMessageHandler });
            const mockRenderBetLogResult = jest.fn();
            mockRenderBetLogResult.mockReturnValue(<div></div>);
            mockDispatch.mockReturnValue(jest.fn());

            const betHistoryBase = <BetHistoryBase isTurnBase={true} renderBetLogResult={mockRenderBetLogResult} />;
            const renderResult = render(betHistoryBase);
            act(() => {
                mockCallback({
                    history: {
                        betLogs: [
                            {
                                drawId: 1234,
                                time: new Date(),
                                result: {},
                                totalAmount: 1,
                                betwin: 1,
                            },
                        ],
                    },
                });
            });
            renderResult.rerender(betHistoryBase);
            act(() => {
                screen.getByTestId("add-data").click();
            });

            expect(gameMessageHandler.broadcastGameEvent).toHaveBeenCalled();
        });
    });
});
