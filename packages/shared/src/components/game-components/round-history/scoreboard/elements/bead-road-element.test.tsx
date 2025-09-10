import { ReactNode } from "react";
import { BeadRoadElement } from "./bead-road-element";
import { render } from "@testing-library/react";

class BeadRoadStub extends BeadRoadElement<number> {
    renderElement(round: number): ReactNode {
        return round;
    }
}

describe(BeadRoadElement.name, () => {
    describe("static arrange", () => {
        describe("when the number of rounds exceeds the size of the board", () => {
            it("should remove them from array", () => {
                // Arrange
                const rounds = Array.from({ length: 20 }, (_, i) => i);
                const scoreboard = { props: { column: 3, row: 5 } };
                const expected = Array.from({ length: 15 }, (_, i) => 14 - i);

                // Act
                const actual = BeadRoadElement.arrange(rounds, scoreboard as any);

                // Assert
                expect(actual).toStrictEqual(expected);
            });
        });

        describe("when the number of rounds is less than the size of the board", () => {
            it("should add more element into array", () => {
                // Arrange
                const rounds = Array.from({ length: 10 }, (_, i) => i);
                const scoreboard = { props: { column: 3, row: 5 } };
                const expected = [...Array.from({ length: 10 }, (_, i) => 9 - i), null, null, null, null, null];

                // Act
                const actual = BeadRoadElement.arrange(rounds, scoreboard as any);

                // Assert
                expect(actual).toStrictEqual(expected);
            });
        });
    });

    describe("render", () => {
        describe("and the round has value", () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<BeadRoadStub round={1} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("and the round is null", () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<BeadRoadStub round={null} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});
