export enum HighlightType {
    None,
    Background,
}

export type BetOptionProps = BaseProps & {
    betChoiceComponent?: JSX.Element;
    betPercentageComponent?: JSX.Element;
    oddsComponent?: JSX.Element;
    ownBetComponent?: JSX.Element;
    playerBetCountComponent?: JSX.Element;
    totalBetComponent?: JSX.Element;
    highlightWinningComponent?: JSX.Element;
    highlightPrevResultComponent?: JSX.Element;
    renderComponents?: ({
        totalBet,
        playerBetCount,
        betPercentage,
        betChoice,
        odds,
        ownBet,
        highlightWinning,
        highlightPrevResult,
    }: {
        totalBet?: JSX.Element;
        playerBetCount?: JSX.Element;
        betPercentage?: JSX.Element;
        betChoice?: JSX.Element;
        odds?: JSX.Element;
        ownBet?;
        highlightWinning?: JSX.Element;
        highlightPrevResult?: JSX.Element;
    }) => JSX.Element;
    onClickBet: any;
};

export type BaseProps = {
    tolgeeNamespace?: string;
    choice: string;
    children?: React.ReactNode;
    className?: string;
    percentageColor?: string;
};
