import { cn } from "@shared";
import { memo } from "react";

const Label = ({ title, className }: { title: string, className?: string }) => {
    return <div className={cn("text-sm md:text-base mb-2 font-medium", className)}>{title}</div>;
};
export default memo(Label);
