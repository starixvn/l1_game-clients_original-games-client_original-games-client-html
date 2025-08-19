import { render } from "@testing-library/react";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import BetDetailModal from "../bet-detail-modal";

const mockGameState = useGameStateContext as jest.Mock;
const mockStateDispatch = useGameStatesDispatch as jest.Mock;

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
    useGameStatesDispatch: jest.fn(),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useCommonTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useClickSound: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock("../../modal-container", () => {
    const ModalContainer = ({ children, onCloseModal }) => (
        <>
            {children}
            <button onClick={onCloseModal} data-testid="close-modal"></button>
        </>
    );
    return ModalContainer;
});

describe(BetDetailModal.name, () => {
    describe("render", () => {
        test.each([
            [true, 1],
            [false, 0],
        ])("when show modal state is %s then show modal %s", (isShow, expected) => {
            mockGameState.mockReturnValue({
                isShowBetDetail: isShow,
            });
            const root = <div id="dashboard"></div>;
            const renderResult = render(root);

            renderResult.rerender(
                <>
                    {root}
                    <BetDetailModal>BetDetail</BetDetailModal>
                </>
            );

            expect(renderResult.queryAllByText("BetDetail").length).toBe(expected);
        });
    });
});
