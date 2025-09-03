import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameActionContext } from "../../../_shared/react-contexts";
import { RoundState } from "../../game-base/type";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import useBettingStore from "../../../_shared/stores/betting-store/betting-store";
import { useShallow } from "zustand/shallow";

interface RippleButtonProps {
    choice: string;
    className: string;
    id: string;
}

const RippleButton: React.FC<RippleButtonProps> = ({ choice, className, id }) => {
    const { selectedChip, isAutoRebetActive } = useBettingStore(
        useShallow((state) => ({
            selectedChip: state.selectedChip,
            isAutoRebetActive: state.isAutoRebetActive,
        }))
    );
    const roundState = useGameStore((state) => state.roundState);
    const rippleButton = useRef<HTMLButtonElement>();

    const [customStyle, setCustomStyle] = useState<object>();
    const [ripplePosX, setRipplePosX] = useState<number>(0);
    const [ripplePosY, setRipplePosY] = useState<number>(0);

    const gameActionContext = useGameActionContext();
    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const onClickBet = useCallback(
        (event, choice: string) => {
            event.preventDefault();
            !isAutoRebetActive && gameActionContext.placeBet(choice, selectedChip);
        },
        [gameActionContext, selectedChip, isAutoRebetActive]
    );

    useEffect(() => {
        if (roundState === RoundState.InRound && !isAutoRebetActive) {
            setCustomStyle({ cursor: `pointer` });
        } else {
            setCustomStyle({ cursor: "not-allowed" });
        }
    }, [roundState, isAutoRebetActive]);

    useEffect(() => {
        let timerId: NodeJS.Timeout | undefined;
        const setPosition = (event) => {
            const item = rippleButton.current as any;

            if (item) {
                const pos = item.getBoundingClientRect();
                const x = event.pageX - pos.left;
                const y = event.pageY - pos.top - window.scrollY;
                setRipplePosX(x);
                setRipplePosY(y);
                item?.firstChild?.classList.add("ripple-effect", "active");
            }
        };

        const reset = (event) => {
            if (event?.target?.firstChild) {
                event.target.firstChild.className = "ripple-effect";
            }

            setRipplePosX(0);
            setRipplePosY(0);
        };

        if (rippleButton?.current) {
            const item = rippleButton?.current;
            clearTimeout(timerId);

            item?.addEventListener("mousedown", (event) => {
                setPosition(event);
            });

            item?.addEventListener("mouseup", (event) => {
                timerId = setTimeout(() => {
                    reset(event);
                }, 500);
            });
        }

        return () => {
            rippleButton?.current?.removeEventListener("mousedown", setPosition);
            rippleButton?.current?.removeEventListener("mouseup", reset);
        };
    }, []);

    return useMemo(() => {
        return (
            <button
                ref={rippleButton}
                className={`btn-ripple ${className} ${isShowDisabledLayer}`}
                id={id}
                onClick={(event) => {
                    onClickBet(event, choice);
                }}
                style={customStyle}
            >
                {
                    <span
                        className="ripple-effect"
                        style={{
                            top: `${ripplePosY}px`,
                            left: `${ripplePosX}px`,
                        }}
                    ></span>
                }
            </button>
        );
    }, [choice, ripplePosX > 0, ripplePosY > 0, customStyle]);
};

export default RippleButton;
