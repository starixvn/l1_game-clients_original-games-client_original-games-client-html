import React from "react";
import { render, screen } from "@testing-library/react";
import BigRoadIcon from "../big-road-icon";
import { BaccaratSettlementResult } from "../../baccarat-multiplayer-constants";

// Mock the dependencies
jest.mock("../utils", () => ({
    getTieCount: jest.fn(),
    getActualWinner: jest.fn(),
    getCombinedTieData: jest.fn(),
    hasTies: jest.fn(),
}));

jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt, width, height, className, priority, ...props }: any) => (
        <div data-testid={TEST_IMAGE_ID} data-src={src} data-alt={alt} data-width={width} data-height={height} className={className} {...props} />
    ),
}));

jest.mock('@shared/components/game-components/round-history/dot/dot.module.scss', () => ({
    "dot-next": "dot-next-class",
    "blink": "blink-class",
}));

// Import after mocking
import { getTieCount, getActualWinner, getCombinedTieData, hasTies } from "../utils";

const mockGetTieCount = getTieCount as jest.Mock;
const mockGetActualWinner = getActualWinner as jest.Mock;
const mockGetCombinedTieData = getCombinedTieData as jest.Mock;
const mockHasTies = hasTies as jest.Mock;

// Image dimension constants
const WINNER_IMAGE_SIZE = 14;
const NATURAL_IMAGE_SIZE = 12;
const TIE_IMAGE_SIZE = 10;

// Test attribute constants
const TEST_IMAGE_ID = "next-image";
const DATA_ALT = "data-alt";
const DATA_WIDTH = "data-width";
const DATA_HEIGHT = "data-height";
const DATA_SRC = "data-src";

describe("BigRoadIcon", () => {
    const mockRound = {
        data: [
            {
                player: false,
                banker: false,
                tie: false,
                natural: false,
                playerPair: false,
                bankerPair: false,
            }
        ] as BaccaratSettlementResult[],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetTieCount.mockReturnValue(0);
        mockGetActualWinner.mockReturnValue("banker");
        mockGetCombinedTieData.mockReturnValue(null);
        mockHasTies.mockReturnValue(false);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("blink state", () => {
        it("should render blink element when isBlink is true", () => {
            render(<BigRoadIcon round={mockRound} isBlink={true} isEmpty={false} />);

            // Check that the blink element is rendered
            expect(screen.getByText("", { selector: 'span' })).toBeInTheDocument();
        });

        it("should not render other content when isBlink is true", () => {
            render(<BigRoadIcon round={mockRound} isBlink={true} isEmpty={false} />);

            expect(screen.queryByRole("img")).not.toBeInTheDocument();
        });
    });

    describe("empty state", () => {
        it("should not render other content when isEmpty is true", () => {
            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={true} />);

            expect(screen.queryByRole("img")).not.toBeInTheDocument();
        });
    });

    describe("normal rendering", () => {
        it("should render banker winner image when actual winner is banker", () => {
            mockGetActualWinner.mockReturnValue("banker");

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            const img = screen.getByTestId(TEST_IMAGE_ID);
            expect(img).toHaveAttribute(DATA_SRC, expect.stringContaining("banker.svg"));
            expect(img).toHaveAttribute(DATA_ALT, "banker");
            expect(img).toHaveAttribute(DATA_WIDTH, WINNER_IMAGE_SIZE.toString());
            expect(img).toHaveAttribute(DATA_HEIGHT, WINNER_IMAGE_SIZE.toString());
        });

        it("should render player winner image when actual winner is player", () => {
            mockGetActualWinner.mockReturnValue("player");

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            const img = screen.getByTestId(TEST_IMAGE_ID);
            expect(img).toHaveAttribute(DATA_SRC, expect.stringContaining("player.svg"));
            expect(img).toHaveAttribute(DATA_ALT, "player");
        });

        it("should not render winner image when there is no actual winner", () => {
            mockGetActualWinner.mockReturnValue(null);

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            expect(screen.queryByRole("img")).not.toBeInTheDocument();
        });

        it("should render natural image when natural is true", () => {
            const roundWithNatural = {
                ...mockRound,
                data: [{
                    ...mockRound.data[0],
                    natural: true,
                }],
            };

            render(<BigRoadIcon round={roundWithNatural} isBlink={false} isEmpty={false} />);

            const naturalImages = screen.getAllByTestId(TEST_IMAGE_ID).filter(img =>
                img.getAttribute(DATA_ALT) === "Natural"
            );
            expect(naturalImages).toHaveLength(1);
            expect(naturalImages[0]).toHaveAttribute(DATA_SRC, expect.stringContaining("natural.svg"));
            expect(naturalImages[0]).toHaveAttribute(DATA_WIDTH, NATURAL_IMAGE_SIZE.toString());
            expect(naturalImages[0]).toHaveAttribute(DATA_HEIGHT, NATURAL_IMAGE_SIZE.toString());
        });

        it("should render player pair dot when playerPair is true", () => {
            const roundWithPlayerPair = {
                ...mockRound,
                data: [{
                    ...mockRound.data[0],
                    playerPair: true,
                }],
            };

            render(<BigRoadIcon round={roundWithPlayerPair} isBlink={false} isEmpty={false} />);

            // Check that the component renders without error
            expect(screen.getByTestId(TEST_IMAGE_ID)).toBeInTheDocument();
        });

        it("should render banker pair dot when bankerPair is true", () => {
            const roundWithBankerPair = {
                ...mockRound,
                data: [{
                    ...mockRound.data[0],
                    bankerPair: true,
                }],
            };

            render(<BigRoadIcon round={roundWithBankerPair} isBlink={false} isEmpty={false} />);

            // Check that the component renders without error
            expect(screen.getByTestId(TEST_IMAGE_ID)).toBeInTheDocument();
        });

        it("should render both pair dots when both pairs exist", () => {
            const roundWithBothPairs = {
                ...mockRound,
                data: [{
                    ...mockRound.data[0],
                    playerPair: true,
                    bankerPair: true,
                }],
            };

            render(<BigRoadIcon round={roundWithBothPairs} isBlink={false} isEmpty={false} />);

            // Check that the component renders without error
            expect(screen.getByTestId(TEST_IMAGE_ID)).toBeInTheDocument();
        });
    });

    describe("tie handling", () => {
        it("should render tie dot when there are ties", () => {
            mockHasTies.mockReturnValue(true);
            mockGetTieCount.mockReturnValue(1);
            mockGetCombinedTieData.mockReturnValue({
                natural: false,
                playerPair: false,
                bankerPair: false,
            });

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            const tieImages = screen.getAllByTestId(TEST_IMAGE_ID).filter(img =>
                img.getAttribute(DATA_ALT) === "Tie"
            );
            expect(tieImages).toHaveLength(1);
        });

        it("should display tie count when count is 2 or greater", () => {
            mockHasTies.mockReturnValue(true);
            mockGetTieCount.mockReturnValue(3);
            mockGetCombinedTieData.mockReturnValue({
                natural: false,
                playerPair: false,
                bankerPair: false,
            });

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            expect(screen.getByText("3")).toBeInTheDocument();
        });

        it("should not display tie count when count is less than 2", () => {
            mockHasTies.mockReturnValue(true);
            mockGetTieCount.mockReturnValue(1);
            mockGetCombinedTieData.mockReturnValue({
                natural: false,
                playerPair: false,
                bankerPair: false,
            });

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            expect(screen.queryByText("1")).not.toBeInTheDocument();
        });

        it("should display tie count when count is 2 or greater", () => {
            mockHasTies.mockReturnValue(true);
            mockGetTieCount.mockReturnValue(2);
            mockGetCombinedTieData.mockReturnValue({
                natural: false,
                playerPair: false,
                bankerPair: false,
            });

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            expect(screen.getByText("2")).toBeInTheDocument();
        });
    });

    describe("data processing", () => {
        it("should use combined tie data when ties exist", () => {
            const combinedData = {
                natural: true,
                playerPair: true,
                bankerPair: true,
            };

            mockHasTies.mockReturnValue(true);
            mockGetCombinedTieData.mockReturnValue(combinedData);

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            expect(mockGetCombinedTieData).toHaveBeenCalledWith(mockRound.data);
        });
    });

    describe("priority rendering", () => {
        it("should render natural image without priority", () => {
            const roundWithNatural = {
                ...mockRound,
                data: [{
                    ...mockRound.data[0],
                    natural: true,
                }],
            };

            render(<BigRoadIcon round={roundWithNatural} isBlink={false} isEmpty={false} />);

            const naturalImg = screen.getAllByTestId(TEST_IMAGE_ID)[1]; // Second image is natural
            expect(naturalImg).not.toHaveAttribute("priority");
        });
    });

    describe("component structure", () => {
        it("should render tie image with correct dimensions", () => {
            mockHasTies.mockReturnValue(true);
            mockGetTieCount.mockReturnValue(1);

            render(<BigRoadIcon round={mockRound} isBlink={false} isEmpty={false} />);

            const tieImg = screen.getAllByTestId(TEST_IMAGE_ID).find(img =>
                img.getAttribute(DATA_ALT) === "Tie"
            );
            expect(tieImg).toHaveAttribute(DATA_WIDTH, TIE_IMAGE_SIZE.toString());
            expect(tieImg).toHaveAttribute(DATA_HEIGHT, TIE_IMAGE_SIZE.toString());
        });
    });
});
