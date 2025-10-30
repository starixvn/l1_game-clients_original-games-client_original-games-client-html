import Styles from "./dot.module.scss";

type Props = {
    choice?: string;
    row?: number;
    col?: number;
    value?: any;
    highlight?: boolean;
    size?: string;
    gameName?: string;
};

export const RoundDot: React.FunctionComponent<Props> = ({ choice = "even", value, highlight = false, size = "", gameName }) => {
    const classDotName = `dot-${choice}`;
    return (
        <div
            className={`${Styles[classDotName]} ${highlight ? "highlight-current-result" : ""} ${Styles[size]}  ${
                gameName ? Styles[gameName] : ""
            }`}
            data-testid="round-dot"
        >
            {value}
        </div>
    );
};

export const RoundDotGrid: React.FunctionComponent<Props> = ({ choice = "even", value, col, row, gameName }) => {
    const classDotName = `dot-grid-${choice}`;

    return (
        <div
            className={`${Styles[classDotName]} ${gameName ? Styles[gameName] : ""}`}
            style={{
                gridColumnStart: col.toString(),
                gridRowStart: row.toString(),
            }}
            data-testid="round-dot-grid"
        >
            {value}
        </div>
    );
};
