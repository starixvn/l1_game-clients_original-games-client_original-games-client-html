import React from "react";

export const Menu: React.FC<{ leftSide?: React.JSX.Element; rightSide?: React.JSX.Element }> = ({ leftSide, rightSide }) => {
    return (
        <div className="p-2 bg-third-bg rounded-b-xl">
            <div className="flex justify-between items-center">
                <div className="flex gap-1 items-center">{leftSide}</div>
                <div className="flex gap-1 items-center">{rightSide}</div>
            </div>
        </div>
    );
};

export default Menu;
