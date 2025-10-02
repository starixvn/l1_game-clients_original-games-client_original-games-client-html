import { useState } from "react";

const VolumeSetting = ({ onChangeVolume, defaultValue }) => {
    const [volume, setVolume] = useState(defaultValue);
    const minValue = 0;
    const maxValue = 100;

    return (
        <input
            type="range"
            min={minValue}
            max={maxValue}
            value={volume}
            step="1"
            onChange={(event) => {
                setVolume(+event.target.value);
                onChangeVolume(event.target.value);
            }}
            style={
                {
                    "--input-range-progress": `${(volume / maxValue) * 100}%`,
                } as React.CSSProperties
            }
        />
    );
};

export default VolumeSetting;
