import { render } from "@testing-library/react";
import { getProviderInstance } from "@tolgee/react";
import { Component, ReactNode, createContext } from "react";
import { TranslatorProps, withTranslator } from "./translator";

jest.mock("@tolgee/react");
jest.mock("../../_shared/react-contexts", () => ({
    loadURLContext: jest.fn(),
}));

class StubComponent extends Component<TranslatorProps> {
    render(): ReactNode {
        this.props.t("Common.key");

        return "";
    }
}

describe(withTranslator.name, () => {
    let tolgee: { t: (key: string) => string };
    beforeEach(() => {
        tolgee = { t: jest.fn() };
        const context = createContext({ tolgee });

        (getProviderInstance as jest.Mock).mockImplementation(() => context);
    });

    describe("when called", () => {
        it("should get tolgee instance", () => {
            // Act
            withTranslator(StubComponent);

            // Assert
            expect(getProviderInstance).toHaveBeenCalled();
        });
    });

    describe("when render the component", () => {
        describe("and call the t function", () => {
            it("should called as expected", () => {
                // Arrange
                const Translator = withTranslator(StubComponent);

                // Act
                render(<Translator key="key" />);

                // Assert
                expect(tolgee.t).toHaveBeenCalledWith("key", { ns: "Common" });
            });
        });
    });
});
