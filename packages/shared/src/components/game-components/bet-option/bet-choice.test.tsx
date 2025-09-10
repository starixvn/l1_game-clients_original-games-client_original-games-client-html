import React from "react";
import { render } from "@testing-library/react";
import BetChoice from "./bet-choice";

jest.mock("../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("../../../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "url",
    },
    getGlossaryTranslate: jest.fn(),
}));

describe("BetChoice", () => {
    test("should match the snapshot", () => {
        // Act
        const { container } = render(<BetChoice tolgeeNamespace="test" choice="abc" className="class" />);

        // Assert
        expect(container).toMatchSnapshot();
    });
});
