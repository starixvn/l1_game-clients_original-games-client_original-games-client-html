import isEmpty from "lodash/isEmpty";
import { useEffect, useState } from "react";
import { messageEventType } from "../../components/game-base/handlers";
import { Round, RoundState } from "../../components/game-base/type";
import { useGameContext } from "../react-contexts";

interface UseResultProps<R> {
    result: R;
    roundState: RoundState;
    roundHistory: Round<R | object, object>[];
    wholeRound?: number;
}

const useResult = <R,>(props: UseResultProps<R>) => {
    const { result, roundState, roundHistory, wholeRound } = props;
    const { gameMessageHandler } = useGameContext();
    const [currentResult, setCurrentResult] = useState<R | object>(null);
    const [isFirstJoinGame, setIsFirstJoinGame] = useState<boolean>(true);
    const [isFirstStartDisplayResultJoinGame, setIsFirstStartDisplayResultJoinGame] = useState<boolean>(true);

    useEffect(() => {
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            if (clientRemainingTime > 0 && clientRemainingTime !== wholeRound) {
                setIsFirstStartDisplayResultJoinGame(false);
            }
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, []);

    useEffect(() => {
        if (isEmpty(result) && roundState === RoundState.DisplayResult && isFirstJoinGame && !isFirstStartDisplayResultJoinGame) {
            setIsFirstJoinGame(false);
            setCurrentResult(roundHistory[0]?.result);
        }

        if (!isEmpty(result)) {
            setIsFirstJoinGame(false);
            setCurrentResult(result);
        }
    }, [roundState, roundHistory, result, isFirstStartDisplayResultJoinGame]);

    return currentResult as R;
};

export default useResult;
