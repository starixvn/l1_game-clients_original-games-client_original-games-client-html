export const finalHashToNumbers = (finalHash: string, index: number) => {
    return parseInt(finalHash.slice(index * 2, index * 2 + 2), 16);
};

export default class PfRoundBaseHelper {
    static buildRemainingBalls({ ballIndexes, totalBalls }) {
        const results: number[] = [];
        let balls = Array.from(Array(totalBalls), (_, index) => index + 1);
        const remainingBalls = [balls];

        ballIndexes.forEach((index: number) => {
            const result = balls[index - 1];
            results.push(result);
            balls = balls.filter((ballValue) => ballValue !== result);
            remainingBalls.push(balls);
        });

        return { results, remainingBalls };
    }

    static buildVerifyInfo({ pfResult, combinedHash, dicesEachRound }) {
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");
        const randomNumbers = (serverSeed?.random || "").split(";").map((x: string) => +x) as number[];
        const rawDigits = combinedHash.match(/.{2}/g);
        const convertNumber = Array.from(Array(dicesEachRound), (_, index) => finalHashToNumbers(combinedHash, index));
        const ballIndexes = randomNumbers.map((x, index) => (x + convertNumber[index]) % 2);
        const severSeedRemain = (serverSeed?.remain || "2;2").split(";");

        return {
            randomNumbers,
            rawDigits,
            convertNumber,
            ballIndexes,
            severSeedRemain,
        };
    }
}
