import { fireEvent, render } from "@testing-library/react";
import { useContext } from "react";
import { Settings } from ".";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { updateURLContext } from "../../../_shared/react-contexts/url-context";
import { useClickSound } from "../../../_shared/react-hooks/use-sound";
import { RoundState } from "../../game-base/type";

const mockUseGameStateContext = useGameStateContext as jest.Mock;
const mockUseGameStatesDispatch = useGameStatesDispatch as jest.Mock;
const mockUsePFDispatch = usePFDispatch as jest.Mock;
const mockUseClickSound = useClickSound as jest.Mock;
const mockUseContext = useContext as jest.Mock;

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useContext: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
    useGameStatesDispatch: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts/game-state-context/pf/pf-context", () => ({
    usePFDispatch: jest.fn(),
}));

jest.mock("../../../_shared/react-hooks/use-sound", () => ({
    useClickSound: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts/url-context", () => ({
    updateURLContext: jest.fn(),
}));

describe("Settings Component", () => {
    const mockBackToRedirectUrl = jest.fn();
    const mockDispatch = jest.fn();
    const mockPFDispatch = jest.fn();
    const mockClickSound = jest.fn();
    
    // Selector constants
    const ICON_HOME_SELECTOR = ".icon-home";
    const ICON_LIST_GAME_SELECTOR = ".icon-list-game";
    const ICON_PF_SELECTOR = ".icon-pf";

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.InRound } as GameStateContextModel);
        mockUseGameStatesDispatch.mockImplementation(() => mockDispatch);
        mockUsePFDispatch.mockImplementation(() => mockPFDispatch);
        mockUseClickSound.mockImplementation(() => mockClickSound);
        (updateURLContext as jest.Mock) = jest.fn();

        mockUseContext.mockReturnValue({
            backToRedirectUrl: mockBackToRedirectUrl,
            redirectUrl: "test-url",
        });
    });

    test("renders without errors", () => {
        render(<Settings />);
    });

    test("should navigate back to lobby on back button click and update  game Id on URLContext to 0 ", () => {
        render(<Settings />);
        fireEvent.click(document.getElementById("icon-home"));
        expect(mockBackToRedirectUrl).toHaveBeenCalledWith("test-url");
        expect(updateURLContext).toHaveBeenCalledWith({ gameId: 0 });
    });

    test("should render home and PF button when redirectUrl is not empty", () => {
        mockUseContext.mockReturnValue({
            backToRedirectUrl: mockBackToRedirectUrl,
            redirectUrl: "test-url",
        });

        const { container } = render(<Settings />);
        expect(container.querySelector(ICON_HOME_SELECTOR)).toBeInTheDocument();
        expect(container.querySelector(ICON_PF_SELECTOR)).toBeInTheDocument();
    });

    test("should render list game and PF button when redirectUrl is empty", () => {
        mockUseContext.mockReturnValue({
            backToRedirectUrl: mockBackToRedirectUrl,
            redirectUrl: "",
        });

        const { container } = render(<Settings />);
        expect(container.querySelector(ICON_LIST_GAME_SELECTOR)).toBeInTheDocument();
        expect(container.querySelector(ICON_PF_SELECTOR)).toBeInTheDocument();
    });

    test("should not render list game when redirectUrl is not empty", () => {
        mockUseContext.mockReturnValue({
            backToRedirectUrl: mockBackToRedirectUrl,
            redirectUrl: "test-url",
        });

        const { container } = render(<Settings />);
        expect(container.querySelector(ICON_LIST_GAME_SELECTOR)).not.toBeInTheDocument();
    });

    test("should render only PF button when redirectUrl is empty", () => {
        mockUseContext.mockReturnValue({
            backToRedirectUrl: mockBackToRedirectUrl,
            redirectUrl: "",
        });

        const { container } = render(<Settings />);
        expect(container.querySelector(ICON_HOME_SELECTOR)).not.toBeInTheDocument();
        expect(container.querySelector(ICON_LIST_GAME_SELECTOR)).toBeInTheDocument();
        expect(container.querySelector(ICON_PF_SELECTOR)).toBeInTheDocument();
    });

    test("should dispatch the correct action on PF settings button click", () => {
        render(<Settings />);
        fireEvent.click(document.getElementById("icon-pf"));
        expect(mockPFDispatch).toHaveBeenCalledWith({
            type: PFEventActionType.TOGGLE_PF_SETTING,
            payload: { isShowPFSetting: true },
        });
        expect(mockClickSound).toHaveBeenCalled();
    });

    test("should not dispatch the correct action on PF settings button click when disable game", () => {
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.Disabled } as GameStateContextModel);
        render(<Settings />);
        fireEvent.click(document.getElementById("icon-pf"));
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockClickSound).not.toHaveBeenCalled();
    });
});
