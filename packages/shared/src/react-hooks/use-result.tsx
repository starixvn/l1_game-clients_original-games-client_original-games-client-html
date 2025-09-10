import isEmpty from "lodash/isEmpty";
import { useEffect, useState } from "react";
import { Round, RoundState } from '@shared/components/game-base/type';

interface UseResultProps<R> {
    result: R;
    roundState: RoundState;
    roundHistory: Round<R | object, object>[];
}

const useResult = <R,>(props: UseResultProps<R>) => {
    const { result, roundState, roundHistory } = props;
    const [currentResult, setCurrentResult] = useState<R | object>(null);
    const [isFirstJoinGame, setIsFirstJoinGame] = useState<boolean>(true);

    useEffect(() => {
        if (isEmpty(result) && roundState === RoundState.DisplayResult && isFirstJoinGame) {
            setIsFirstJoinGame(false);
            setCurrentResult(roundHistory[0]?.result);
        }

        if (!isEmpty(result)) {
            setIsFirstJoinGame(false);
            setCurrentResult(result);
        }
    }, [roundState, roundHistory, result]);

    return currentResult as R;
};

export default useResult;
