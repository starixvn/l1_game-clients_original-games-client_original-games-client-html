import { FC, ReactNode } from "react";
import Styles from "../provably-fair.module.scss";
import { cn } from "@shared/utils";

const Section: FC<{ children?: ReactNode; title: ReactNode; customTitleStyles?: string }> = ({ children, title, customTitleStyles }) => (
    <>
        <h3 className={cn(`${Styles["section-title"]} ${customTitleStyles} text-sm md:text-base py-1`)}>{title}</h3>
        {children}
    </>
);

export default Section;
