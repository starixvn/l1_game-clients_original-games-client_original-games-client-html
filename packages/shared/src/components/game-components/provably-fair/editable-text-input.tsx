import { FC } from "react";
import Styles from "./provably-fair.module.scss";
import { useClickSound } from '@shared/merged/_shared/react-hooks';

const NUMBER_VALUES = "0123456789";

const isCommand = (event: KeyboardEvent) => {
    return (
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === "c" ||
            event.key.toLowerCase() === "v" ||
            event.key.toLowerCase() === "x" ||
            event.key.toLowerCase() === "a")
    );
};

const isControl = (event: KeyboardEvent) => {
    return event.key === "ArrowLeft" || event.key === "ArrowRight";
};

const EditableTextInput: FC<{ handleOnChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void; value: string | number }> = ({
    handleOnChangeValue,
    value,
}) => {
    const clickSound = useClickSound();
    const handleOnKeyDown = (event: any) => {
        const chr = event.key;
        if (NUMBER_VALUES.indexOf(chr) < 0 && event.which !== 8 && !isCommand(event) && !isControl(event)) {
            event.preventDefault();
        }
    };

    const handleOnPaste = (event: any) => {
        const value = event.clipboardData.getData("text");
        const numberRegex = /^\d+$/;
        if (!numberRegex.test(value)) {
            event.preventDefault();
        }
    };

    const handleClickEdit = () => {
        clickSound();
        const input = document.getElementById("merge-client-seed-verification") as HTMLInputElement;
        const inputGroupEditable = document.getElementById("merge-client-seed-group-editable") as HTMLInputElement;
        inputGroupEditable.className = `input-group ${Styles["input-group-editable"]} width-full mb-3`;
        input.readOnly = false;
        input.className = `form-control ${Styles["form-control-editable"]}`;
        input.focus();
        input.select();
    };

    return (
        <div id="merge-client-seed-group-editable" className="input-group width-full mb-3">
            <input
                className="form-control"
                type="text"
                name="merge-client-seed-verification"
                id="merge-client-seed-verification"
                value={value}
                readOnly
                inputMode="numeric"
                onChange={handleOnChangeValue}
                onKeyDown={handleOnKeyDown}
                onPaste={handleOnPaste}
            />
            <button className={Styles["copy-btn"]} onClick={handleClickEdit}>
                <span className="icon-edit" />
            </button>
        </div>
    );
};

export default EditableTextInput;
