import React, { useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../../_shared/react-hooks";
import Styles from "./menu.module.scss";
import { RoundState } from "../../../game-base/type";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { PFEventActionType } from "../../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { usePFDispatch } from "../../../../_shared/react-contexts/game-state-context/pf/pf-context";

const dropdownItemClassName = "dropdown-item";

export const Menu: React.FC = () => {
    const { roundState } = useGameStateContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const specialClassByDevice = !isMobileOnly ? "desktop-style" : "";
    const dispatch = useGameStatesDispatch();
    const clickSound = useClickSound();
    const pfDispatch = usePFDispatch();

    const handleClickPFSetting = () => {
        console.log("[Menu] pf.open", { roundState });
        if (roundState === RoundState.Disabled) {
            console.log("[Menu] pf.blocked: round disabled");
            return;
        }

        clickSound();
        console.log("[Menu] pf.dispatch.toggle");
        pfDispatch({
            type: PFEventActionType.TOGGLE_PF_SETTING,
            payload: {
                isShowPFSetting: true,
            },
        });

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.PFSetting,
            action: TrackingAction.Open,
        });
        console.log("[Menu] analytics.track", { function: TrackingFunction.PFSetting, action: TrackingAction.Open });
    };


    const openBetHistory = () => {
        if (roundState === RoundState.Disabled) {
            console.log("[Menu] history.blocked: round disabled");
            return;
        }

        clickSound();
        console.log("[Menu] history.dispatch.toggle");
        dispatch({
            type: GameEventActionType.TOGGLE_BET_HISTORY,
            payload: {
                isShowBetHistory: true,
            },
        });
        setDropdownOpen(false);

        AnalyticsHelper.trackFunction({ function: TrackingFunction.BetHistory, action: TrackingAction.Open });
        console.log("[Menu] analytics.track", { function: TrackingFunction.BetHistory, action: TrackingAction.Open });
    };

    const openGuide = () => {
        if (roundState === RoundState.Disabled) {
            console.log("[Menu] guide.blocked: round disabled");
            return;
        }

        clickSound();
        console.log("[Menu] guide.dispatch.toggle");
        dispatch({
            type: GameEventActionType.TOGGLE_GAME_GUIDE,
            payload: {
                isShowGameGuide: true,
            },
        });
        setDropdownOpen(false);
        AnalyticsHelper.trackFunction({ function: TrackingFunction.GameGuide, action: TrackingAction.Open });
        console.log("[Menu] analytics.track", { function: TrackingFunction.GameGuide, action: TrackingAction.Open });
    };

    const handleClickOutside = (event) => {
        if (wrapperRef && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            if (dropdownOpen) {
                console.log("[Menu] click.outside: close");
            }
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className={`${Styles["game-menu"]} ${Styles[specialClassByDevice]}`}>
            <div
                className={`${Styles["menu-toggle-btn"]}`}
                id="icon-menu"
                onClick={() => {
                    clickSound();
                    const next = !dropdownOpen;
                    console.log("[Menu] toggle.dropdown", { from: dropdownOpen, to: next });
                    setDropdownOpen(next);
                }}
            >
                <span className={`icon-menu ${Styles["menu-icon"]}`}></span>
            </div>
            <div className="dropdown">
                <div className={`dropdown-menu right ${Styles["dropdown-menu"]} ${dropdownOpen ? "show" : ""}`}>
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} onClick={handleClickPFSetting}>
                        <span id="icon-pf" className={`icon-pf ${Styles["menu-icon"]}`}></span>
                    </div>
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} onClick={openBetHistory}>
                        <span id="icon-history" className={`icon-history ${Styles["menu-icon"]}`}></span>
                    </div>
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} onClick={openGuide}>
                        <span id="icon-guide" className={`icon-guide ${Styles["menu-icon"]}`}></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
