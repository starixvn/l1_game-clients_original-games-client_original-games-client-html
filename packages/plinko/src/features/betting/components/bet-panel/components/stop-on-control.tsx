export const StopOnControl = ({
    value,
    setValue,
    isDisabled,
}: {
    value: number;
    setValue: (value: number) => void;
    isDisabled: boolean;
}) => {
    return (
        <input
            type="number"
            step={1}
            pattern="[0-9]*"
            value={value}
            onChange={(e) => setValue(Number((+e.target.value).toFixed(2)))}
            inputMode="numeric"
            className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11 disabled:opacity-50"
            disabled={isDisabled}
        />
    );
};
