import { memo } from "react";
import { useRebet } from '@shared/react-hooks/use-rebet';
import useGameStore from '@shared/stores/game-store/game-store';
import { RoundState } from "../../game-base/type";
import { broadcastNotice, getNotice } from '@shared/helpers';
import { NoticeErrorCode } from '@shared/constants/error-code-dictionary';
import { useClickSound, useCommonTranslate } from '@shared/react-hooks';
import dynamic from "next/dynamic";
const Tooltip = dynamic(() => import("../tooltip"), { ssr: false });

const DoubleBetIcon = () => {
    const { isEnabled, handleClickRebet } = useRebet(true);
    const roundState = useGameStore((state) => state.roundState);
    const { t } = useCommonTranslate();
    const clickSound = useClickSound();

    const onClick = () => {
        clickSound();
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
        <div className="relative group pr-6 md:pr-0">
            <Tooltip message={t("tooltip_double")}>
            <div
                className={`rounded-full w-[52px] h-[52px] flex items-center justify-center border border-solid bg-[#1a274999] border-[#0097ff33] transition-all duration-300 ${
                    isEnabled ? "cursor-pointer hover:scale-110 opacity-100" : "opacity-50 cursor-auto"
                }"`}
                onClick={onClick}
            >
                <i className="icon-double-bet text-xl"></i>
            </div>
            </Tooltip>
        </div>
    );
};

export default memo(DoubleBetIcon);
