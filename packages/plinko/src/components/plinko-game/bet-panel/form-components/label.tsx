import { cn } from "@shared";
import { capitalizeFirstLetter } from "@shared/helpers/string-helper";
import { memo } from "react";

const Label = ({ title, className }: { title: string, className?: string }) => {
    return <div className={cn("text-sm md:text-base mb-2 font-medium", className)}>{capitalizeFirstLetter(title)}</div>;
};
export default memo(Label);
