import Styles from "./statistic.module.scss";
import { Props } from "./types";

const StatisticItem: React.FC<Props> = (props) => {
    return (
        <div className={`${Styles["statistic-group"]} ${props.className}`}>
            {props.children}
            <span className={Styles["number"]}>{props.value}</span>
        </div>
    );
};

export default StatisticItem;
