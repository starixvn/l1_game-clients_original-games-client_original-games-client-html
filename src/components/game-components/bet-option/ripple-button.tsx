import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameActionContext, useSettingContext, useSystemContext } from "../../../_shared/react-contexts";
import { resolveChipColorHex } from "../../../_shared/constants";
import { RoundState } from "../../game-base/type";
import useGameStore from "../../../_shared/stores/game-store/game-store";

interface RippleButtonProps {
    choice: string;
    className: string;
    id: string;
}

export const DEFAULT_CHIP_CURSOR_PATH = "/static/images/chips/cursor";
const RippleButton: React.FC<RippleButtonProps> = ({ choice, className, id }) => {
    const systemContext = useSystemContext();
    const roundState = useGameStore((state) => state.roundState);
    const rippleButton = useRef<HTMLButtonElement>();

    const [customStyle, setCustomStyle] = useState<object>();
    const [cursorImage, setCursorImage] = useState<string>("");
    const [ripplePosX, setRipplePosX] = useState<number>(0);
    const [ripplePosY, setRipplePosY] = useState<number>(0);

    const gameActionContext = useGameActionContext();
    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const settingContext = useSettingContext();
    const chipSettings = settingContext.chipSettings;

    const onClickBet = useCallback(
        (event, choice: string) => {
            event.preventDefault();
            gameActionContext.placeBet(choice, systemContext.selectedChip);
        },
        [gameActionContext, systemContext.selectedChip]
    );

    const findChipSetting = (value) => {
        return chipSettings?.find((c) => c.value === value);
    };

    useEffect(() => {
        const color = findChipSetting(systemContext.selectedChip)?.color;
        const hex = resolveChipColorHex(color);
        setCursorImage(`${DEFAULT_CHIP_CURSOR_PATH}/${hex}.svg`.appendBuildVersion());
    }, [systemContext.selectedChip]);

    useEffect(() => {
        if (roundState === RoundState.InRound) {
            setCustomStyle({ cursor: `url(${cursorImage}), auto` });
        } else {
            setCustomStyle({ cursor: "not-allowed" });
        }
    }, [cursorImage, roundState]);

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
                            top: `calc(1 / var(--zoom-game) * ${ripplePosY}px)`,
                            left: `calc(1 / var(--zoom-game) * ${ripplePosX}px)`,
                        }}
                    ></span>
                }
            </button>
        );
    }, [choice, ripplePosX > 0, ripplePosY > 0, customStyle]);
};

export default RippleButton;
