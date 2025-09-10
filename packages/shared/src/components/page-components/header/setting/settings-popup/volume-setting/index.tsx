import { useEffect, useRef, useState } from "react";
import Style from "./volume-setting.module.scss";

const VolumeSetting = ({ onChangeVolume, defaultValue }) => {
    const [volume, setVolume] = useState(defaultValue);
    const volumeRef = useRef(null);
    const minValue = 0;
    const maxValue = 100;
    const enableColor = "rgb(96, 218, 0)";

    useEffect(() => {
        const progress = (volume / maxValue) * 100;
        volumeRef.current.style.background = `linear-gradient(to right, ${enableColor} ${progress}%, rgb(108, 125, 113) ${progress}%)`;
    }, [volume]);

    return (
        <input
            ref={volumeRef}
            className={`${Style["range-input"]}`}
            type="range"
            min={minValue}
            max={maxValue}
            value={volume}
            step="1"
            onChange={(event) => {
                setVolume(+event.target.value);
                onChangeVolume(event.target.value);
            }}
        />
    );
};

export default VolumeSetting;
