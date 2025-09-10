import { render } from "@testing-library/react";
import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { DerivedElement } from "./derived-element";

type Round = { win: boolean; tie: boolean };

class DerivedElementStub extends DerivedElement {
    renderA(): ReactNode {
        return "A";
    }
    renderB(): ReactNode {
        return "B";
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

describe(DerivedElement.name, () => {
    describe("static arrange", () => {
        describe("when called", () => {
            it("should return value match the snapshot", () => {
                // Arrange
                const rounds: Round[] = [
                    { win: true, tie: false },
                    { win: true, tie: true },
                    { win: false, tie: false },
                    { win: false, tie: true },
                    { win: false, tie: false },
                ];
                const scoreboard = { props: { row: 6, column: 5 } } as any;

                // Act
                const actual = DerivedElement.arrange(new RoundConverter(), "bigEyeBoy")(rounds, scoreboard);

                // Assert
                expect(actual).toMatchSnapshot();
            });
        });
    });

    describe("render", () => {
        test.each([[{}], [{ status: true }], [{ status: false }]])("should match the snapshot", (round: any) => {
            // Act
            const { container } = render(<DerivedElementStub round={round} />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});
