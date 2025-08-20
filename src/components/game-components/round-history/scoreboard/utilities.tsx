export function toFlattenColumns<T>(rows: T[][]): T[] {


    const result = {};

    rows.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
            if (result[columnIndex]) {
                result[columnIndex][rowIndex] = cell;
            } else {
                result[columnIndex] = { [rowIndex]: cell };
            }
        });
    });

    return Object.values(result).flatMap((data) => Object.values(data));
}

export function chunk<T>(array: T[], size: number): T[][] {


    const result = [];

    for (let i = 0; i < array.length; i += size) {
        const chunk = array.slice(i, i + size);
        result.push(chunk);
    }



    return result;
}

export function fitContent<T>(rounds: T[], capacity: number, addition: T) {


    if (rounds.length > capacity) {
        return rounds.slice(rounds.length - capacity);
    }

    const additions = Array.from({ length: capacity - rounds.length }, (_) => addition);
    return [...rounds, ...additions];
}
