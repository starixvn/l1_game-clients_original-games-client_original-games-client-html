export interface DefaultCardProps {
    result: {
        card: number;
        type: number;
    };
    srcPathCard: string;
}

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
