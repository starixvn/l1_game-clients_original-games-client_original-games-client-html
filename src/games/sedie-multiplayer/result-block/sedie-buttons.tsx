import { CachedImage } from "../../../components/game-components/cached-image";
import { BgCachedImage } from "../../../components/game-components/cached-image/bg-cached-image";
import styles from "./sedie-plate.module.scss";

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
                <>
                    <div
                        className={`absolute w-[49px] h-[49px]`}
                        style={{
                            left: `${button.x - 10.5}px`,
                            top: `${button.y - 10.5}px`,
                        }}
                    >
                        <BgCachedImage
                            pathImage={"/static/images/sedie-multiplayer/result/shadow.svg"}
                            backgroundPosition="center"
                            backgroundSize="cover"
                            backgroundRepeat="no-repeat"
                            className="relative w-[49px] h-[49px] top-[0px] left-[0px]"
                        />
                    </div>
                    <div
                        key={index}
                        className={`${styles["button"]} absolute w-[${size}px] h-[${size}px]`}
                        style={{
                            left: `${button.x}px`,
                            top: `${button.y}px`,
                        }}
                    >
                        {buttonsValue[index] ? (
                            <CachedImage src={"/static/images/sedie-multiplayer/result/red.svg"} alt="Red" width={size} height={size} />
                        ) : (
                            <CachedImage src={"/static/images/sedie-multiplayer/result/white.svg"} alt="White" width={size} height={size} />
                        )}
                    </div>
                </>
            ))}
        </div>
    );
};
