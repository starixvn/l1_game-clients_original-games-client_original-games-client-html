import { render, screen } from "@testing-library/react";
import HeaderTitle from "..";
import { ResourceTypes } from "../../../../../_shared/resources";

// Mock next/image
jest.mock("next/image", () => ({ __esModule: true, default: (props: any) => <img {...props} /> }));

// Mock app-settings
jest.mock("../../../../../_shared/app-settings", () => ({
    getAppSettings: jest.fn(),
}));

// Mock react-contexts
jest.mock("../../../../../_shared/react-contexts", () => ({
    useURLContext: jest.fn(),
}));

// Mock react-hooks
jest.mock("../../../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn(),
}));

describe("HeaderTitle component", () => {
    const mockGameId = 101;
    const mockNamespace = "SABA_NUMBER";

    const mockGameSettings = {
        id: mockGameId,
        tolgeeNamespace: mockNamespace,
        gameName: "Test Game",
        gameResourceConfigs: {
            path: "/test/path",
        },
    };

    const mockAppSettings = {
        serverDomainMapper: [],
        socketGatewayPath: "",
        proxy: { ssl: "", subDomain: "", path: "" },
        sentry: { dsn: "", environment: "" },
        gameSettings: {},
        subGuideDomain: "",
        googleAnalyticId: "",
        enableMsgpackParser: false,
        system: "",
        appType: 0,
        useTolgeeStatic: false,
        enableDebugLogs: false,
        gamePath: "",
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Default mock implementations
        const { getAppSettings } = require("../../../../../_shared/app-settings");
        getAppSettings.mockReturnValue({
            ...mockAppSettings,
            gameSettings: {
                [mockGameId]: mockGameSettings,
            },
        });

        const { useURLContext } = require("../../../../../_shared/react-contexts");
        useURLContext.mockReturnValue({
            isSabaPlay: false,
        });

        const { useTranslator } = require("../../../../../_shared/react-hooks");
        useTranslator.mockReturnValue({
            t: (key: string) => `TRANSLATED: ${key}`,
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe("when isRenderGames is true", () => {
        test("renders game name correctly", () => {
            // Act
            render(<HeaderTitle isRenderGames={true} openingGameId={mockGameId} />);
            const gameName = screen.getByText(`TRANSLATED: ${mockNamespace}.game_name_${mockGameId}`.toUpperCase());

            // Assert
            expect(gameName).toBeInTheDocument();
        });

        test("uses default namespace when game setting is not found", () => {
            // Arrange
            const { getAppSettings } = require("../../../../../_shared/app-settings");
            getAppSettings.mockReturnValue({
                ...mockAppSettings,
                gameSettings: {},
            });

            // Act
            render(<HeaderTitle isRenderGames={true} openingGameId={999} />);
            const gameName = screen.getByText("TRANSLATED: SabaNumber.game_name_999".toUpperCase());

            // Assert
            expect(gameName).toBeInTheDocument();
        });
    });

    describe("when isRenderGames is false", () => {
        test("renders default logo", () => {
            // Act
            render(<HeaderTitle isRenderGames={false} openingGameId={mockGameId} />);
            const image = screen.getByAltText("Logo") as HTMLImageElement;

            // Assert
            expect(image).toBeInTheDocument();
            expect(image.src).toContain("logo-site.svg");
        });
    });

    test("should match the snapshot", () => {
        // Act
        const { container } = render(<HeaderTitle isRenderGames={true} openingGameId={mockGameId} />);

        // Assert
        expect(container).toMatchSnapshot();
    });
});
