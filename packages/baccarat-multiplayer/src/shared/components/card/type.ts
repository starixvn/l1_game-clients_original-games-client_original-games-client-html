export type Props = {
    result: ObjectResult;
    isSmall?: boolean;
    isAnimation?: boolean;
    customClassName?: string;
    viewMode?: string;
};

export interface ObjectResult {
    card: number;
    type: number;
}
