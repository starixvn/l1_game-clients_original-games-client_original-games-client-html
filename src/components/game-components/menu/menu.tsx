import React, { useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { RoundState } from "../../game-base/type";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../_shared/helpers";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";

const dropdownItemClassName = "dropdown-item";

export const Menu: React.FC<{ leftSide?: React.JSX.Element; rightSide?: React.JSX.Element }> = ({ leftSide, rightSide }) => {
    const { roundState } = useGameStateContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dispatch = useGameStatesDispatch();
    const clickSound = useClickSound();
    const pfDispatch = usePFDispatch();

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
        <div className="p-2 bg-white dark:bg-secondary-bg rounded-b-xl">
            <div className="flex justify-between items-center">
                <div className="flex gap-1 items-center">{leftSide}</div>
                <div className="flex gap-1 items-center">{rightSide}</div>
            </div>
        </div>
    );
};
