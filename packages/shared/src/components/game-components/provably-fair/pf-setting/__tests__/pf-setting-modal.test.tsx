import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import PFSettingModal, { TIME_OUT } from "../index";
import { useGameContext } from "@shared/react-contexts";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useClientSeedPF, useCommonTranslate, useSNTranslate } from "@shared/react-hooks";
import usePFStore from "@shared/stores/pf-store/pf-store";
import useGameStore from "@shared/stores/game-store/game-store";
import { messageEventType } from "@shared/components/game-base/handlers";

// Mock all dependencies
jest.mock("@shared/react-contexts", () => ({
    useGameContext: jest.fn(),
}));

jest.mock("@shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
}));

jest.mock("@shared/stores/pf-store/pf-store", () => jest.fn());
jest.mock("@shared/stores/game-store/game-store", () => jest.fn());

jest.mock("@shared/react-hooks", () => ({
    useClickSound: jest.fn(() => jest.fn()),
    useClientSeedPF: jest.fn(),
    useCommonTranslate: jest.fn(),
    useSNTranslate: jest.fn(),
}));

// Mock child components
jest.mock("@shared/components/game-components/modal-container", () => {
    return function MockModalContainer({ children, isOpen, onCloseModal, title }: any) {
        return isOpen ? (
            <div data-testid="modal-container">
                <div data-testid="modal-header">
                    <button data-testid="close-button" onClick={onCloseModal}>
                        Close
                    </button>
                    {title}
                </div>
                <div data-testid="modal-content">{children}</div>
            </div>
        ) : null;
    };
});

jest.mock("../../copyable-text-input", () => ({
    __esModule: true,
    default: ({ value, id }: { value: string; id: string }) => (
        <input data-testid={id} value={value} readOnly />
    ),
}));

jest.mock("../../pf-guide", () => ({
    ButtonPFGuide: () => <button data-testid="pf-guide-button">PF Guide</button>,
}));

jest.mock("../../../game-loading/loading-spinner", () => ({
    LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock helpers
jest.mock("@shared/helpers/number-helper", () => ({
    randomNumberSeries: jest.fn(() => "1234"),
}));

jest.mock("zustand/shallow", () => ({
    useShallow: jest.fn((selector) => selector),
}));

jest.mock("@shared/utils", () => ({
    cn: jest.fn((...args) => args.filter(Boolean).join(" ")),
}));

const mockUseGameContext = useGameContext as jest.Mock;
const mockUseGameStateContext = useGameStateContext as jest.Mock;
const mockUseClientSeedPF = useClientSeedPF as jest.Mock;
const mockUseCommonTranslate = useCommonTranslate as jest.Mock;
const mockUseSNTranslate = useSNTranslate as jest.Mock;
const mockUsePFStore = usePFStore as unknown as jest.Mock;
const mockUseGameStore = useGameStore as unknown as jest.Mock;

const TEST_ROUND_ID = "test-round-123";

describe("PFSettingModal", () => {
    const mockGameMessageHandler = {
        register: jest.fn(() => "handler-id"),
        removeHandler: jest.fn(),
        broadcastGameEvent: jest.fn(),
    };

    const defaultGameStateContext = {
        roundId: TEST_ROUND_ID
    };

    const defaultPFStoreState = {
        isShowPFSetting: true,
        pfClientSeedSetting: {
            roundId: TEST_ROUND_ID,
            randomClientSeed: "5678",
            useManualClientSeed: false,
        },
        serverSeedHash: "test-server-hash-123",
        updatePFClientSeedSetting: jest.fn(),
        togglePFSetting: jest.fn(),
        updateServerSeedHash: jest.fn(),
    };

    const defaultGameStoreState = {
        ownBets: {},
    };

    const defaultHooks = {
        clientSeed: "test-client-seed",
        t: (key: string) => key,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Setup default mocks
        mockUseGameContext.mockReturnValue({
            gameMessageHandler: mockGameMessageHandler,
        });

        mockUseGameStateContext.mockReturnValue(defaultGameStateContext);

        mockUseClientSeedPF.mockReturnValue({
            clientSeed: defaultHooks.clientSeed,
        });

        mockUseCommonTranslate.mockReturnValue({
            t: defaultHooks.t,
        });

        mockUseSNTranslate.mockReturnValue({
            t: defaultHooks.t,
        });

        mockUsePFStore.mockReturnValue(defaultPFStoreState);
        mockUseGameStore.mockReturnValue(defaultGameStoreState);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("Modal Rendering", () => {
        it("should render modal when isShowPFSetting is true", () => {
            render(<PFSettingModal />);

            expect(screen.getByTestId("modal-container")).toBeInTheDocument();
            expect(screen.getByTestId("pf-guide-button")).toBeInTheDocument();
        });

        it("should not render modal when isShowPFSetting is false", () => {
            mockUsePFStore.mockReturnValue({
                ...defaultPFStoreState,
                isShowPFSetting: false,
            });

            render(<PFSettingModal />);

            expect(screen.queryByTestId("modal-container")).not.toBeInTheDocument();
        });

        it("should render with custom client seed info", () => {
            const customInfo = "Custom client seed information";
            render(<PFSettingModal customClientSeedInfo={customInfo} />);

            expect(screen.getByText(customInfo)).toBeInTheDocument();
        });
    });

    describe("Client Seed Functionality", () => {
        it("should display random client seed by default", async () => {
            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            await waitFor(() => {
                const randomInput = screen.getByDisplayValue("5678");
                expect(randomInput).toBeInTheDocument();
            });
        });

        it("should switch to manual mode when manual radio is clicked", async () => {
            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            await waitFor(() => {
                const manualRadio = screen.getByLabelText(/pf_client_seed_para_3/i);
                const manualInput = screen.getByDisplayValue("");

                expect(manualInput).toBeDisabled();
            });

            await act(async () => {
                const manualRadio = screen.getByLabelText(/pf_client_seed_para_3/i);
                fireEvent.click(manualRadio);
            });

            await waitFor(() => {
                const manualInput = screen.getByTestId("manual-client-seed");
                expect(manualInput).toHaveValue("5678");
                expect(manualInput).not.toBeDisabled();
            });
        });

        it("should switch back to random mode when random radio is clicked", async () => {
            mockUsePFStore.mockReturnValue({
                ...defaultPFStoreState,
                pfClientSeedSetting: {
                    ...defaultPFStoreState.pfClientSeedSetting,
                    useManualClientSeed: true,
                },
            });

            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            await waitFor(() => {
                const randomRadio = screen.getByLabelText(/pf_client_seed_para_4/i);
                const manualInput = screen.getByDisplayValue("");

                expect(manualInput).not.toBeDisabled();
            });

            await act(async () => {
                const randomRadio = screen.getByLabelText(/pf_client_seed_para_4/i);
                fireEvent.click(randomRadio);
            });

            await waitFor(() => {
                const manualInput = screen.getByDisplayValue("");
                expect(manualInput).toBeDisabled();
            });
        });

        it("should handle manual client seed input changes", async () => {
            mockUsePFStore.mockReturnValue({
                ...defaultPFStoreState,
                pfClientSeedSetting: {
                    ...defaultPFStoreState.pfClientSeedSetting,
                    useManualClientSeed: true,
                },
            });

            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            await waitFor(() => {
                const manualInput = screen.getByDisplayValue("");
            });

            await act(async () => {
                const manualInput = screen.getByDisplayValue("");
                fireEvent.change(manualInput, { target: { value: "1234" } });
            });

            await waitFor(() => {
                const manualInput = screen.getByDisplayValue("1234");
                expect(manualInput).toHaveValue("1234");
            });
        });

        it("should call updatePFSetting when manual input changes", async () => {
            mockUsePFStore.mockReturnValue({
                ...defaultPFStoreState,
                pfClientSeedSetting: {
                    ...defaultPFStoreState.pfClientSeedSetting,
                    useManualClientSeed: true,
                },
            });

            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            // Find the manual input and change its value
            const manualInput = screen.getByTestId("manual-client-seed");

            await act(async () => {
                fireEvent.change(manualInput, { target: { value: "1234" } });
            });

            // Check that broadcastGameEvent was called with the new value
            await waitFor(() => {
                expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                    [messageEventType.SAVE_PF_SETTING]: {
                        pfClientSeedSetting: {
                            manualClientSeed: "1234",
                        },
                    },
                });
            });
        });

        it("should call updatePFSetting with random seed when manual input is blurred and empty", async () => {
            mockUsePFStore.mockReturnValue({
                ...defaultPFStoreState,
                pfClientSeedSetting: {
                    ...defaultPFStoreState.pfClientSeedSetting,
                    useManualClientSeed: true,
                },
            });

            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            // Find the manual input and blur it when empty
            const manualInput = screen.getByTestId("manual-client-seed");

            await act(async () => {
                fireEvent.blur(manualInput);
            });

            // Check that broadcastGameEvent was called with the random seed value
            await waitFor(() => {
                expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                    [messageEventType.SAVE_PF_SETTING]: {
                        pfClientSeedSetting: {
                            manualClientSeed: "5678",
                        },
                    },
                });
            });
        });
    });

    describe("Event Handlers", () => {
        it("should register event handlers on mount", () => {
            render(<PFSettingModal />);

            expect(mockGameMessageHandler.register).toHaveBeenCalledWith(
                messageEventType.SAVE_PF_SETTING,
                expect.any(Function)
            );
            expect(mockGameMessageHandler.register).toHaveBeenCalledWith(
                messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED,
                expect.any(Function)
            );
            expect(mockGameMessageHandler.register).toHaveBeenCalledWith(
                messageEventType.SAVE_PF_SETTING_FROM_ROUND_ID_HANLDER,
                expect.any(Function)
            );
        });

        it("should handle save PF setting message", () => {
            render(<PFSettingModal />);

            // Simulate receiving a save PF setting message
            const saveHandlerCall: any[] = mockGameMessageHandler.register.mock.calls.find(
                (call: any[]) => call[0] === messageEventType.SAVE_PF_SETTING
            );
            const saveHandler = saveHandlerCall[1];

            const mockPFSetting = { test: "data" };
            if (saveHandler) {
                saveHandler({ [messageEventType.SAVE_PF_SETTING]: { pfClientSeedSetting: mockPFSetting } });
            }

            expect(mockUsePFStore().updatePFClientSeedSetting).toHaveBeenCalledWith(mockPFSetting);
        });


        it("should handle round ID change", () => {
            render(<PFSettingModal />);

            const roundIdHandlerCall: any[] = mockGameMessageHandler.register.mock.calls.find(
                (call: any[]) => call[0] === messageEventType.SAVE_PF_SETTING_FROM_ROUND_ID_HANLDER
            );
            const roundIdHandler = roundIdHandlerCall[1];

            const mockRoundId = TEST_ROUND_ID;
            if (roundIdHandler) {
                roundIdHandler({ [messageEventType.SAVE_PF_SETTING_FROM_ROUND_ID_HANLDER]: { roundId: mockRoundId } });
            }

            expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                [messageEventType.SEND_SOCKET_MESSAGE]: {
                    event: "getRoundPF",
                    data: { roundId: mockRoundId },
                },
            });
        });
    });

    describe("Modal Close", () => {
        it("should close modal when close button is clicked", () => {
            const mockTogglePFSetting = jest.fn();
            mockUsePFStore.mockReturnValue({
                ...defaultPFStoreState,
                togglePFSetting: mockTogglePFSetting,
            });

            render(<PFSettingModal />);

            const closeButton = screen.getByTestId("close-button");

            fireEvent.click(closeButton);

            expect(mockTogglePFSetting).toHaveBeenCalled();
        });
    });

    describe("Bets Overlay", () => {
        it("should show overlay when there are active bets", async () => {
            mockUseGameStore.mockReturnValue({
                ...defaultGameStoreState,
                ownBets: { bet1: { amount: 100 } },
            });

            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            await waitFor(() => {
                const overlay = screen.getByTestId("modal-content").querySelector(".form-overlay");
                expect(overlay).toBeInTheDocument();
            });
        });
    });

    describe("Round ID Changes", () => {
        it("should fetch PF info when round ID changes", async () => {
            const { rerender } = render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            // Change round ID
            mockUseGameStateContext.mockReturnValue({
                roundId: "test-round-456",
            });

            await act(async () => {
                rerender(<PFSettingModal />);
            });

            await waitFor(() => {
                expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                    [messageEventType.SEND_SOCKET_MESSAGE]: {
                        event: "getRoundPF",
                        data: { roundId: "test-round-456" },
                    },
                });
            });
        });
    });

    describe("Server Seed Updates", () => {
        it("should handle server seed updates from PF publish message", async () => {
            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            // Simulate PF publish message
            const pfHandlerCall: any[] = mockGameMessageHandler.register.mock.calls.find(
                (call: any[]) => call[0] === "pf"
            );
            const pfHandler = pfHandlerCall[1];

            const mockServerSeed = "new-server-seed";
            if (pfHandler) {
                act(() => {
                    pfHandler({ pf: { serverSeedHash: mockServerSeed } });
                });
            }

            expect(mockUsePFStore().updateServerSeedHash).toHaveBeenCalledWith(mockServerSeed);
        });

        it("should handle server seed updates from PF result message", async () => {
            render(<PFSettingModal />);

            await act(async () => {
                jest.advanceTimersByTime(TIME_OUT);
            });

            // Simulate PF result message
            const pfResultHandlerCall: any[] = mockGameMessageHandler.register.mock.calls.find(
                (call: any[]) => call[0] === "roundPFResult"
            );
            const pfResultHandler = pfResultHandlerCall[1];

            const mockServerSeed = "result-server-seed";
            if (pfResultHandler) {
                act(() => {
                    pfResultHandler({ roundPFResult: { serverSeedHash: mockServerSeed } });
                });
            }

            expect(mockUsePFStore().updateServerSeedHash).toHaveBeenCalledWith(mockServerSeed);
        });
    });
});
