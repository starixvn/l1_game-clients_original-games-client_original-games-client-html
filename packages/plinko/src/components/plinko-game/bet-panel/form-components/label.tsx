import { memo } from "react";

const Label = ({ title }: { title: string }) => {
    return <div className="text-sm md:text-base mb-2 font-semibold">{title}</div>;
};
export default memo(Label);
