import Styles from "./icon-statistic.module.scss";

export const IconStatistic = ({ onClick }: { onClick?: () => void }) => {
    return (
        <div data-testid="icon-statistic" className={`cursor-pointer h-10 w-10 flex items-center justify-center`} onClick={onClick}>
            <div className={`${Styles["icon"]} absolute h-10 w-10 rounded-full`}></div>
            <i className="icon-statistic"></i>
        </div>
    );
};
