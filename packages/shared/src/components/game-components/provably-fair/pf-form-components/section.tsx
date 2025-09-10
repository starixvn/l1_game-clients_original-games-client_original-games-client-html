import { FC, ReactNode } from "react";
import Styles from "../provably-fair.module.scss";

const Section: FC<{ children?: ReactNode; title: ReactNode; customTitleStyles?: string }> = ({ children, title, customTitleStyles }) => (
    <>
        <h3 className={`${Styles["section-title"]} ${customTitleStyles}`}>{title}</h3>
        {children}
    </>
);

export default Section;
