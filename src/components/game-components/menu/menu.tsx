import styles from "./menu.module.scss";

export const Menu = ({ leftSide, rightSide }: { leftSide?: React.JSX.Element; rightSide?: React.JSX.Element }) => {
    return (
        <div className="p-2 dark:bg-[#101721] bg-primary-bg rounded-b-xl">
            <div className="flex flex-1 gap-1 items-center">{leftSide}</div>
            <div className="flex flex-1 gap-1 items-center justify-end">{rightSide}</div>
        </div>
    );
};
