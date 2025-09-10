import { toFlattenColumns } from "./utilities";

describe(toFlattenColumns.name, () => {
    describe("when called", () => {
        it("should return as expected", () => {
            // Act
            const actual = toFlattenColumns([
                [1, 2],
                [3, 4],
            ]);

            // Assert
            expect(actual).toStrictEqual([1, 3, 2, 4]);
        });
    });
});
