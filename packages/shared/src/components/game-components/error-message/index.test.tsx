import { render } from "@testing-library/react";
import React from "react";
import { ConnectFailedMessage } from ".";
import "../../../_shared/helpers/string-helper";
import { updateURLContext } from "../../../_shared/react-contexts";
import BaseDialog from "../base-dialog";
import { ConnectFailedReasonKey } from "./type";

jest.mock("../base-dialog", () => jest.fn());
jest.mock("../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key, op) => key) }),
}));
jest.mock("../../../_shared/react-contexts", () => ({ URLContext: null, updateURLContext: jest.fn() }));
let realUseContext;
let useContextMock: jest.Mock;
beforeEach(() => {
    realUseContext = React.useContext;
    useContextMock = React.useContext = jest.fn();
});
afterEach(() => {
    React.useContext = realUseContext;
});
const BaseDialogMock = ({ children }) => {
    return <div>{children}</div>;
};

const reconnectMess = "SabaNumber.button_reconnect";
const callReconnectMess = "should call reconnect when click reconnect";
describe(ConnectFailedMessage.name, () => {
    beforeAll(() => {
        (BaseDialog as jest.Mock).mockImplementation(BaseDialogMock);
    });
    const ns = "gameA";
    const gameId = 1;
    const enableBackdrop = false;
    const renderComponent = (reason) =>
        render(
            <ConnectFailedMessage enableBackdrop={enableBackdrop} id={gameId} onReconnect={null} reason={reason} tolgeeNamespace={ns} />
        );
    describe("when restrictPlayPermission", () => {
        const reason = ConnectFailedReasonKey.restrictPlayPermission;

        describe("when redirectUrl has data", () => {
            const original = window.location;

            beforeAll(() => {
                Object.defineProperty(window, "location", {
                    configurable: true,
                    value: { reload: jest.fn() },
                });
            });
            afterAll(() => {
                Object.defineProperty(window, "location", { configurable: true, value: original });
            });
            afterEach(() => {
                jest.clearAllMocks();
            });

            it("should render button ok", () => {
                // arrange
                useContextMock.mockReturnValue({ redirectUrl: "returnUrl" });

                // act
                const { container, getByRole } = renderComponent(reason);

                // assert
                expect(container).toMatchSnapshot();
                expect(getByRole("button").textContent).toBe("Common.ok");
            });

            it("should back to lobby & reload when click ok", () => {
                // arrange
                useContextMock.mockReturnValue({ redirectUrl: "returnUrl" });
                const { getByRole } = renderComponent(reason);

                // act
                getByRole("button").click();

                // assert
                expect(updateURLContext).toHaveBeenCalledWith({ backToLobby: true, gameId: 0 });
                expect(window.location.reload).toHaveBeenCalled();
            });
        });

        describe("when redirectUrl has data and backToRedirectUrl function", () => {
            afterEach(() => {
                jest.clearAllMocks();
            });
            it("should render button ok", () => {
                // arrange
                useContextMock.mockReturnValue({ redirectUrl: "returnUrl" });

                // act
                const { container, getByRole } = renderComponent(reason);

                // assert
                expect(container).toMatchSnapshot();
                expect(getByRole("button").textContent).toBe("Common.ok");
            });

            it("should back to lobby & call backToRedirectUrl when click ok", () => {
                // arrange
                const backToRedirectUrl = jest.fn();
                useContextMock.mockReturnValue({ redirectUrl: "returnUrl", backToRedirectUrl });
                const { getByRole } = renderComponent(reason);

                // act
                getByRole("button").click();

                // assert
                expect(updateURLContext).toHaveBeenCalledWith({ backToLobby: true, gameId: 0 });
                expect(backToRedirectUrl).toHaveBeenCalledWith("returnUrl");
            });
        });

        describe("when redirectUrl not has data", () => {
            it("should not render button ok", () => {
                // act
                useContextMock.mockReturnValue({});
                const { container, queryByRole } = renderComponent(reason);

                // assert
                expect(container).toMatchSnapshot();
                expect(queryByRole("button")).not.toBeInTheDocument();
            });
        });
    });

    describe("when disconnect game services", () => {
        const reason = ConnectFailedReasonKey.lostConnection;
        afterEach(() => {
            jest.clearAllMocks();
        });
        describe("when redirectUrl has data", () => {
            it("should render buttons back & reconnect", () => {
                // arrange
                useContextMock.mockReturnValue({ redirectUrl: "returnUrl" });

                // act
                const { container, getAllByRole } = renderComponent(reason);
                const buttons = getAllByRole("button");

                // assert
                expect(container).toMatchSnapshot();
                expect(buttons.length).toBe(2);
                expect(buttons[0].textContent).toBe("Common.back");
                expect(buttons[1].textContent).toBe(reconnectMess);
            });

            it("should back to lobby when click back", () => {
                // arrange
                const backToRedirectUrl = jest.fn();
                useContextMock.mockReturnValue({ redirectUrl: "returnUrl", backToRedirectUrl });
                const { getAllByRole } = renderComponent(reason);
                const backButton = getAllByRole("button")[0];

                // act
                backButton.click();

                // assert
                expect(updateURLContext).toHaveBeenCalledWith({ gameId: 0 });
                expect(backToRedirectUrl).toHaveBeenCalledWith("returnUrl");
            });

            it(callReconnectMess, () => {
                // arrange
                useContextMock.mockReturnValue({ redirectUrl: "returnUrl" });
                const onReconnect = jest.fn();
                const { getAllByRole } = render(
                    <ConnectFailedMessage
                        enableBackdrop={enableBackdrop}
                        id={gameId}
                        onReconnect={onReconnect}
                        reason={reason}
                        tolgeeNamespace={ns}
                    />
                );
                const reconnectButton = getAllByRole("button")[1];

                // act
                reconnectButton.click();

                // assert
                expect(onReconnect).toHaveBeenCalled();
            });
        });

        describe("when redirectUrl not has data", () => {
            it("should render only reconnect button", () => {
                // arrange
                useContextMock.mockReturnValue({});

                // act
                const { container, getAllByRole } = renderComponent(reason);
                const buttons = getAllByRole("button");

                // assert
                expect(container).toMatchSnapshot();
                expect(buttons.length).toBe(1);
                expect(buttons[0].textContent).toBe(reconnectMess);
            });
            it(callReconnectMess, () => {
                // arrange
                useContextMock.mockReturnValue({});
                const onReconnect = jest.fn();
                const { getAllByRole } = render(
                    <ConnectFailedMessage
                        enableBackdrop={enableBackdrop}
                        id={gameId}
                        onReconnect={onReconnect}
                        reason={reason}
                        tolgeeNamespace={ns}
                    />
                );
                const reconnectButton = getAllByRole("button")[0];

                // act
                reconnectButton.click();

                // assert
                expect(onReconnect).toHaveBeenCalled();
            });
        });
    });
});
