import { memo } from "react";
import { useRebet } from "../../../_shared/react-hooks/use-rebet";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { RoundState } from "../../game-base/type";
import { broadcastNotice, getNotice } from "../../../_shared/helpers";
import { NoticeErrorCode } from "../../../_shared/constants/error-code-dictionary";

const DoubleBetIcon = () => {
    const { isEnabled, handleClickRebet } = useRebet(true);
    const roundState = useGameStore((state) => state.roundState);

    const onClick = () => {
        if (!isEnabled) {
            return;
        }
        if (roundState !== RoundState.InRound) {
            broadcastNotice(getNotice(NoticeErrorCode.placeBetNextRound, false));
            return;
        }
        handleClickRebet();
    };

    return (
        <div
            className={`rounded-full w-[52px] h-[52px] flex items-center justify-center border border-solid bg-[#1a274999] border-[#0097ff33] transition-all duration-300 ${
                isEnabled ? "cursor-pointer hover:scale-110 opacity-100" : "opacity-50 cursor-auto"
            }"`}
            onClick={onClick}
        >
            <i className="icon-double-bet text-xl"></i>
        </div>
    );
};

export default memo(DoubleBetIcon);
