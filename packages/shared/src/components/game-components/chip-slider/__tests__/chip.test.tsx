import { render } from "@testing-library/react";
import { Chip } from "../chip";
import useBettingStore from '@shared/stores/betting-store/betting-store';

jest.mock("axios");
jest.mock("../../../../_shared/stores/betting-store/betting-store", () => jest.fn());

describe(Chip.name, () => {
    beforeAll(() => {
        (useBettingStore as unknown as jest.Mock).mockReturnValue(100);
    });

    it("should render match the snapshot when chip < 1000", () => {
        // arrange
        const value = 100;
        const text = "100";
        const color = "#000123";

        // act
        const { container } = render(<Chip color={color} onClickChip={null} text={text} value={value} />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe(text);
    });

    it("should render match the snapshot when chip > 1000 & text is empty", () => {
        // arrange
        const value = 2000;
        const text = "";
        const color = "#000123";

        // act
        const { container } = render(<Chip color={color} onClickChip={null} text={text} value={value} />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("2K");
    });

    it("should call onClickChip when click on chip", () => {
        // arrange
        const value = 100;
        const text = "100";
        const color = "#000123";
        const onClickChip = jest.fn();
        const { container } = render(<Chip color={color} onClickChip={onClickChip} text={text} value={value} />);

        // act
        (container.children[0] as any).click();

        // assert
        expect(onClickChip).toHaveBeenCalled();
    });
});
