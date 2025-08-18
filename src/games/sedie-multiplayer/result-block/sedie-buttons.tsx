import styles from "./sedie-plate.module.scss";
import Image from "next/image";

export const SedieButtons = ({
    buttonsPosition,
    buttonsValue,
    size,
}: {
    buttonsPosition: Array<{ x: number; y: number }>;
    buttonsValue: boolean[];
    size: number;
}) => {
    return (
        <div className={styles["buttons-container"]}>
            {buttonsPosition.map((button, index) => (
                <div
                    key={index}
                    className={styles["button"]}
                    style={{
                        position: "absolute",
                        left: `${button.x}px`,
                        top: `${button.y}px`,
                        cursor: "pointer",
                        width: `${size}px`,
                        height: `${size}px`,
                    }}
                >
                    {buttonsValue[index] ? (
                        <Image src={"/static/images/sedie-multiplayer/result/red.png"} alt="Red" width={size} height={size} />
                    ) : (
                        <Image src={"/static/images/sedie-multiplayer/result/white.png"} alt="White" width={size} height={size} />
                    )}
                </div>
            ))}
        </div>
    );
};
