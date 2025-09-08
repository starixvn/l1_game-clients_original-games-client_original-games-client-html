import React, { useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../../_shared/react-hooks";
import Styles from "./menu.module.scss";
import { RoundState } from "../../../game-base/type";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { MenuIcon } from "../../menu/menu-icon";
import usePopupStore from "../../../../_shared/stores/popup-store/popup-store";
import usePFStore from "../../../../_shared/stores/pf-store/pf-store";
import { cn } from "../../../../_shared/utils/merge-tailwind-util";

const dropdownItemClassName = "dropdown-item";

export const Menu: React.FC = () => {
    const { roundState } = useGameStateContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const specialClassByDevice = !isMobileOnly ? "desktop-style" : "";
    const clickSound = useClickSound();
    const togglePFSetting = usePFStore((state) => state.togglePFSetting);
    const toggleGameGuide = usePopupStore((state) => state.toggleGameGuide);

    const handleClickPFSetting = () => {
        if (roundState === RoundState.Disabled) {
            return;
        }

        clickSound();
        togglePFSetting(true);

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.PFSetting,
            action: TrackingAction.Open,
        });
    };

    const openGuide = () => {
        if (roundState === RoundState.Disabled) {
            return;
        }
        clickSound();
        toggleGameGuide(true);
        setDropdownOpen(false);
        AnalyticsHelper.trackFunction({ function: TrackingFunction.GameGuide, action: TrackingAction.Open });
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
        <div ref={wrapperRef} className={cn(`${Styles["game-menu"]} ${Styles[specialClassByDevice]}, gap-x-[6px]`)}>
            <MenuIcon name="sound" />
            <MenuIcon name="guide" onClick={openGuide} />
            <MenuIcon name="pf" onClick={handleClickPFSetting} />
        </div>
    );
};
