import { render } from "@testing-library/react";
import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { BigRoadElement, BigRoadRound } from "./big-road-element";

type Round = { win: boolean; tie: boolean };

class BigRoadStub extends BigRoadElement<Round> {
    renderElement(round: BigRoadRound<Round>): ReactNode {
        return round.data.join(",");
    }
}

class RoundConverter extends Converter<Round> {
    protected positiveKey(): string {
        return "win";
    }

    protected specialKey(): string {
        return "tie";
    }
}

describe(BigRoadElement.name, () => {
    describe("static arrange", () => {
        describe("when called", () => {
            it("should return value match the snapshot", () => {
                // Arrange
                const rounds: Round[] = [
                    { win: true, tie: false },
                    { win: true, tie: true },
                    { win: false, tie: false },
                    { win: false, tie: true },
                ];
                const scoreboard = { props: { row: 6, column: 5 } } as any;

                // Act
                const actual = BigRoadElement.arrange(new RoundConverter())(rounds, scoreboard);

                // Assert
                expect(actual).toMatchSnapshot();
            });
        });
    });

    describe("render", () => {
        describe("and the round has value", () => {
            it("should match the snapshot", () => {
                // Arrange
                const round = { data: [1, 2] } as any;

                // Act
                const { container } = render(<BigRoadStub round={round} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("and the round is empty", () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<BigRoadStub round={{ data: [] }} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});
