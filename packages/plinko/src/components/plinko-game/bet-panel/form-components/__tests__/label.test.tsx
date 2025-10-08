import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Label from "../label";

describe("Label", () => {
    describe("Rendering", () => {
        it("should render title text", () => {
            // Arrange
            const title = "Test Label";

            // Act
            const { container } = render(<Label title={title} />);

            // Assert
            expect(container).toMatchSnapshot();
            expect(screen.getByText(title)).toBeInTheDocument();
        });
    });
});
