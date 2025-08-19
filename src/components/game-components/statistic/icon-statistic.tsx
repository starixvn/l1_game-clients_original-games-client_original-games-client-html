import Image from "next/image";
import Styles from "./icon-statistic.module.scss";

export const IconStatistic = ({ onClick }: { onClick?: () => void }) => {
    return (
        <div data-testid="icon-statistic" className={`cursor-pointer h-10 w-10 flex items-center justify-center`} onClick={onClick}>
            <div className={`${Styles["icon"]} absolute h-10 w-10 rounded-full`}></div>
            <Image src={`/static/images/icons/statistic.svg`} height={15} width={15} className="h-[15px]" alt="Logo" />
        </div>
    );
};
