import { RoundState } from '@shared/merged/components/game-base/type';

export function isHighLightWinningResult({ betChoice, roundState, settlementResult, showResultInfo }) {
    return roundState === RoundState.DisplayResult && showResultInfo && settlementResult?.[betChoice];
}

export function isShowHighlightPrevResult({ betChoice, roundState, roundHistory }) {
    if (roundHistory[0]) {
        return (
            [RoundState.SwitchRound, RoundState.BeforePlaceBet, RoundState.InRound].includes(roundState) &&
            roundHistory[0].settlementResult[betChoice]
        );
    }

    return false;
}
