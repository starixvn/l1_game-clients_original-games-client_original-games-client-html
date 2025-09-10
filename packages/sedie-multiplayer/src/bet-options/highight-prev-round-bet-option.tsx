import { useShallow } from "zustand/react/shallow";
import { isShowHighlightPrevResult } from '@shared/react-hooks/use-high-light';
import useGameStore from '@shared/stores/game-store/game-store';
import styles from "./highight-prev-round-bet-option.module.scss";

export const HighlightPrevRoundBetOption = ({ choice }: { choice: string }) => {
    const { roundHistory, roundState } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, roundState: state.roundState }))
    );
    const isShow = isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory });
    return isShow ? <div className={`${styles["highlight-option"]} ${styles[choice]}`}></div> : null;
};
export default HighlightPrevRoundBetOption;
