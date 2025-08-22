import React, { useEffect, useRef, useState } from "react";

export const Menu: React.FC<{ leftSide?: React.JSX.Element; rightSide?: React.JSX.Element }> = ({ leftSide, rightSide }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

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
        <div className="p-2 bg-secondary-bg rounded-b-xl">
            <div className="flex justify-between items-center">
                <div className="flex gap-1 items-center">{leftSide}</div>
                <div className="flex gap-1 items-center">{rightSide}</div>
            </div>
        </div>
    );
};
