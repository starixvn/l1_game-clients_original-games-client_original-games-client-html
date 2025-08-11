import styles from "./item.module.scss";

export const RoundHistoryItem = ({ result, isBlink, isHighlight }: { result: boolean; isBlink: boolean; isHighlight: boolean }) => {
    return <div className={`${styles["item"]} ${result ? styles["item-true"] : styles["item-false"]}`}></div>;
};
