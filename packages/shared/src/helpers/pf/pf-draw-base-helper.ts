export const finalHashToNumbers = (finalHash: string, index: number) => {
    return parseInt(finalHash.slice(index * 2, index * 2 + 2), 16);
};

export default class PfDrawBaseHelper {
    static buildRemainingBalls({ ballIndexes, remainingBalls }) {
        const results: number[] = [];
        const newRemainBalls = [remainingBalls];

        ballIndexes.forEach((index: number) => {
            const result = remainingBalls[index - 1];
            results.push(result);
            remainingBalls = remainingBalls.filter((ballValue) => ballValue !== result);
            newRemainBalls.push(remainingBalls);
        });
        return { results, remainingBalls: newRemainBalls };
    }

    static buildVerifyInfo({ pfResult, combinedHash, ballsEachRound }) {
        const rawDigits = combinedHash.match(/.{2}/g);
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");
        const randomNumbers: number[] = (serverSeed?.random || "").split(";").map((x: string) => +x);
        const remainingBalls: string[] = (serverSeed?.remain || "").split(":");
        const convertNumber = Array.from(Array(ballsEachRound), (_, index) => finalHashToNumbers(combinedHash, index));
        const ballIndexes = randomNumbers.map((x, index) => ((x + convertNumber[index]) % (remainingBalls?.length - index)) + 1);

        return {
            rawDigits,
            randomNumbers,
            convertNumber,
            ballIndexes,
            ...this.buildRemainingBalls({ ballIndexes, remainingBalls }),
        };
    }
}
