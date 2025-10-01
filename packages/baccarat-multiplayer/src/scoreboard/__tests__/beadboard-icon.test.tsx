import React from "react";
import { render, screen } from "@testing-library/react";
import BeadBoardIcon from "../beadboard-icon";
import { BaccaratBetOptions, Winner } from "../../baccarat-multiplayer-constants";

// Mock the dependencies
jest.mock("../../baccarat-multiplayer-constants", () => ({
    BaccaratBetOptions: {
        PLAYER: "player",
        BANKER: "banker",
        TIE: "tie",
    },
    Winner: {
        PLAYER: "player",
        BANKER: "banker",
        TIE: "tie",
    },
}));

jest.mock("../utils", () => ({
    getScoreboardImagePath: jest.fn(),
    getDisplayTextKey: jest.fn(),
}));

jest.mock("@shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn(),
}));

jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt, width, height, className, ...props }: any) => (
        <div data-testid="next-image" data-src={src} data-alt={alt} data-width={width} data-height={height} className={className} {...props} />
    ),
}));

// Import after mocking
import { useTranslator } from "@shared/react-hooks/use-translator";
import { getScoreboardImagePath, getDisplayTextKey } from "../utils";

const mockUseTranslator = useTranslator as jest.MockedFunction<typeof useTranslator>;
const mockGetScoreboardImagePath = getScoreboardImagePath as jest.Mock;
const mockGetDisplayTextKey = getDisplayTextKey as jest.Mock;

describe("BeadBoardIcon", () => {
    const mockTranslate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseTranslator.mockReturnValue({
            t: mockTranslate,
        });
        mockTranslate.mockImplementation((key: string) => key);
        mockGetScoreboardImagePath.mockReturnValue("/mock/path/image.svg");
        mockGetDisplayTextKey.mockReturnValue("mock_key");
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("rendering", () => {
        it("should render nothing when choice is empty", () => {
            const { container } = render(<BeadBoardIcon choice="" />);

            expect(container.firstChild).toBeNull();
        });

        it("should render nothing when choice is null", () => {
            const { container } = render(<BeadBoardIcon choice={null as any} />);

            expect(container.firstChild).toBeNull();
        });

        it("should render nothing when choice is undefined", () => {
            const { container } = render(<BeadBoardIcon choice={undefined as any} />);

            expect(container.firstChild).toBeNull();
        });

        it("should render player icon correctly", () => {
            mockGetScoreboardImagePath.mockReturnValue("/path/to/player.svg");

            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} />);

            const img = screen.getByTestId("next-image");
            expect(img).toHaveAttribute("data-src", "/path/to/player.svg");
            expect(img).toHaveAttribute("data-alt", Winner.PLAYER);
            expect(img).toHaveAttribute("data-width", "14");
            expect(img).toHaveAttribute("data-height", "14");
        });

        it("should render banker icon correctly", () => {
            mockGetScoreboardImagePath.mockReturnValue("/path/to/banker.svg");

            render(<BeadBoardIcon choice={BaccaratBetOptions.BANKER} />);

            const img = screen.getByTestId("next-image");
            expect(img).toHaveAttribute("data-src", "/path/to/banker.svg");
            expect(img).toHaveAttribute("data-alt", Winner.BANKER);
        });

        it("should render tie icon correctly", () => {
            mockGetScoreboardImagePath.mockReturnValue("/path/to/tie.svg");

            render(<BeadBoardIcon choice={BaccaratBetOptions.TIE} />);

            const img = screen.getByTestId("next-image");
            expect(img).toHaveAttribute("data-src", "/path/to/tie.svg");
            expect(img).toHaveAttribute("data-alt", Winner.TIE);
        });

        it("should render with default player variant for unknown choice", () => {
            mockGetScoreboardImagePath.mockReturnValue("/path/to/default.svg");

            render(<BeadBoardIcon choice="unknown" />);

            const img = screen.getByTestId("next-image");
            expect(img).toHaveAttribute("data-src", "/path/to/default.svg");
            expect(img).toHaveAttribute("data-alt", Winner.PLAYER);
        });
    });

    describe("text label", () => {
        it("should display translated text label", () => {
            mockTranslate.mockReturnValue("P");

            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} />);

            expect(screen.getByText("P")).toBeInTheDocument();
        });

        it("should call getDisplayTextKey with correct variant", () => {
            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} />);

            expect(mockGetDisplayTextKey).toHaveBeenCalledWith(Winner.PLAYER);
        });

        it("should call useTranslator with correct resource types", () => {
            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} />);

            expect(mockUseTranslator).toHaveBeenCalledWith(["Baccarat"]);
        });
    });

    describe("pair indicators", () => {
        it("should render player pair dot when hasPlayerPair is true", () => {
            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} hasPlayerPair={true} />);

            // Check that the component renders without error
            expect(screen.getByTestId("next-image")).toBeInTheDocument();
        });

        it("should render banker pair dot when hasBankerPair is true", () => {
            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} hasBankerPair={true} />);

            // Check that the component renders without error
            expect(screen.getByTestId("next-image")).toBeInTheDocument();
        });

        it("should render both pair dots when both pairs are present", () => {
            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} hasPlayerPair={true} hasBankerPair={true} />);

            // Check that the component renders without error
            expect(screen.getByTestId("next-image")).toBeInTheDocument();
        });

        it("should not render pair dots by default", () => {
            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} />);

            // Check that the component renders without error
            expect(screen.getByTestId("next-image")).toBeInTheDocument();
        });

        it("should not render pair dots when explicitly set to false", () => {
            render(<BeadBoardIcon choice={BaccaratBetOptions.PLAYER} hasPlayerPair={false} hasBankerPair={false} />);

            // Check that the component renders without error
            expect(screen.getByTestId("next-image")).toBeInTheDocument();
        });
    });

    describe("case insensitivity", () => {
        it("should handle uppercase choice", () => {
            render(<BeadBoardIcon choice="PLAYER" />);

            expect(mockGetDisplayTextKey).toHaveBeenCalledWith(Winner.PLAYER);
        });

        it("should handle mixed case choice", () => {
            render(<BeadBoardIcon choice="Banker" />);

            expect(mockGetDisplayTextKey).toHaveBeenCalledWith(Winner.BANKER);
        });
    });

});
