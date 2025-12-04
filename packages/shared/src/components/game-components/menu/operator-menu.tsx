import { memo } from "react";
import { getOperator } from "@shared/helpers/router-helper";

const operatorMap = {
    "12BET": "12BET Originals",
    NOVA88: "Nova88 Originals",
};
const OperatorMenu = () => {
    const operator = getOperator() || "";
    const label = operatorMap[operator] || "";

    return (
        <div className="bg-gradient-to-br from-[#6F8FC4] via-[#455F8A] to-[#364D74] bg-clip-text text-transparent font-semibold text-sm tracking-wider align-middle md:text-base">
            {label}
        </div>
    );
};

export default memo(OperatorMenu);
