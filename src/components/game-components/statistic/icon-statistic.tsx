import Image from "next/image";
import Styles from "./icon-statistic.module.scss";
export const IconStatistic = () => {
    const onClick = () => {};
    return (
        <div className={`${Styles["icon"]} cursor-pointer p-2 rounded-full`} onClick={onClick}>
            <Image src={`/static/images/icons/statistic.svg`} height={15} width={15} className="h-[15px]" alt="Logo" />
        </div>
    );
};
