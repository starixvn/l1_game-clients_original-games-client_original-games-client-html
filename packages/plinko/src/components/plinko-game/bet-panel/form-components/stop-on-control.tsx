import { memo } from "react";
import Label from "./label";

const StopOnControl = ({
    value,
    setValue,
    isDisabled,
    title,
}: {
    value: number;
    setValue: (value: number) => void;
    isDisabled: boolean;
    title: string;
}) => {
    return (
        <div>
            <Label title={title} />
            <input
                type="number"
                step={0.01}
                pattern="[0-9]*"
                maxLength={22}
                value={value?.toString() || "0"}
                onChange={(e) => setValue(Math.abs(+e.target.value))}
                onBlur={(e) => setValue(Number((+e.target.value).toFixed(2)))}
                inputMode="numeric"
                className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11 disabled:opacity-50"
                disabled={isDisabled}
            />
        </div>
    );
};

export default memo(StopOnControl);
