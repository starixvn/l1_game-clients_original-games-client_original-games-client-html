export const binomial = (n: number, k: number) => {
    if (k > n) { return 0; }
    let result = 1;
    for (let i = 0; i < k; i++) {
        result *= (n - i) / (i + 1);
    }
    return result;
};

export const calculateProbability = (n: number, k: number) => {
    const binom = binomial(n, k);
    const totalPossibilities = Math.pow(2, n);
    return binom / totalPossibilities;
};