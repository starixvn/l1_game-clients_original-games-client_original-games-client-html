export function toFlattenColumns<T>(rows: T[][]): T[] {
    console.log("[utilities] toFlattenColumns - input rows:", {
        rowsCount: rows.length,
        rows: rows.map((row, index) => ({ index, length: row.length }))
    });

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

    const flattened = Object.values(result).flatMap((data) => Object.values(data));

    console.log("[utilities] toFlattenColumns - output:", {
        resultKeys: Object.keys(result),
        flattenedLength: flattened.length
    });

    return flattened;
}

export function chunk<T>(array: T[], size: number): T[][] {
    console.log("[utilities] chunk - input:", {
        arrayLength: array.length,
        size,
        expectedChunks: Math.ceil(array.length / size)
    });

    const result = [];

    for (let i = 0; i < array.length; i += size) {
        const chunk = array.slice(i, i + size);
        result.push(chunk);
    }

    console.log("[utilities] chunk - output:", {
        chunksCount: result.length,
        chunks: result.map((chunk, index) => ({ index, length: chunk.length }))
    });

    return result;
}

export function fitContent<T>(rounds: T[], capacity: number, addition: T) {
    console.log("[utilities] fitContent - input:", {
        roundsLength: rounds.length,
        capacity,
        needsTrimming: rounds.length > capacity,
        needsPadding: rounds.length < capacity
    });

    if (rounds.length > capacity) {
        const trimmed = rounds.slice(rounds.length - capacity);
        console.log("[utilities] fitContent - trimmed result:", {
            originalLength: rounds.length,
            trimmedLength: trimmed.length,
            capacity
        });
        return trimmed;
    }

    const additions = Array.from({ length: capacity - rounds.length }, (_) => addition);
    const padded = [...rounds, ...additions];

    console.log("[utilities] fitContent - padded result:", {
        originalLength: rounds.length,
        additionsLength: additions.length,
        paddedLength: padded.length,
        capacity
    });

    return padded;
}
