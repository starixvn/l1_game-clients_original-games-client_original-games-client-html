import { Component } from "react";
import { Scoreboard, ScoreboardItemProps } from "./scoreboard";
import { render, screen } from "@testing-library/react";

const arrange = jest.fn();
const renderItem = jest.fn();

class ScoreboardItemStub extends Component<ScoreboardItemProps<number>> {
    static arrange(rounds: number[]) {
        arrange(rounds);

        return rounds;
    }

    render() {
        renderItem();
        return this.props.round;
    }
}

describe(Scoreboard.name, () => {
    describe("when render component Scoreboard", () => {
        beforeEach(() => {
            arrange.mockReset();
            renderItem.mockReset();

            render(
                <Scoreboard
                    arrange={ScoreboardItemStub.arrange}
                    element={ScoreboardItemStub}
                    column={3}
                    row={3}
                    rounds={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                />
            );
        });

        it("should arrange items", () => {
            // Assert
            expect(arrange).toHaveBeenCalledTimes(1);
        });

        it("should render items", () => {
            // Assert
            expect(renderItem).toHaveBeenCalledTimes(10);
        });

        it("should match snapshot", async () => {
            // Arrange
            const scoreboard = screen.getAllByTestId("scoreboard").at(0).innerHTML;

            // // Assert
            expect(scoreboard).toMatchSnapshot();
        });
    });
});
