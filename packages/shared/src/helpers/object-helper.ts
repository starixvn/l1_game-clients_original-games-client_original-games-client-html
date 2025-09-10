export const objectMap = <T, R>(obj: Record<string, T>, fn: (value: T, key: string, index: number) => R): Record<string, R> =>
    Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
