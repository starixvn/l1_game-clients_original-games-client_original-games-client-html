export const finalHashToNumbers = (finalHash: string, index: number) => {
    return parseInt(finalHash.slice(index * 2, index * 2 + 2), 16);
};

export default class PfRoundBaseHelper {
    static buildVerifyInfo({ pfResult, combinedHash, dicesEachRound }) {
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");
        const randomNumbers = (serverSeed?.random || "").split(";").map((x: string) => +x) as number[];
        const rawDigits = combinedHash.match(/.{2}/g);
        const convertNumber = Array.from(Array(dicesEachRound), (_, index) => finalHashToNumbers(combinedHash, index));
        const diceIndexes = randomNumbers.map((x, index) => (x + convertNumber[index]) % 2);
        const severSeedRemain = (serverSeed?.remain || "2;2").split(";");

        return {
            randomNumbers,
            rawDigits,
            convertNumber,
            diceIndexes,
            severSeedRemain,
        };
    }

    static buildVerifyInfoPlinko({ pfResult, combinedHash, numberOfRows }) {
        const serverSeed = pfResult?.serverSeed || "{}";
        const randomNumbers = (serverSeed?.random || "").split(";").map((x: string) => +x) as number[];
        const rawDigits = combinedHash.match(/.{2}/g);
        const convertNumber = Array.from(Array(numberOfRows), (_, index) => finalHashToNumbers(combinedHash, index));
        const diceIndexes = randomNumbers.map((x, index) => (x + convertNumber[index]) % 2);
        const severSeedRemain = (serverSeed?.remain || "2;2").split(";");

        return {
            randomNumbers,
            rawDigits,
            convertNumber,
            diceIndexes,
            severSeedRemain,
        };
    }
}
