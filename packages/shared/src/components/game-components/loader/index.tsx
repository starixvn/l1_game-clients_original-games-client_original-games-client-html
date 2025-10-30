import React from "react";

import { useGameContext } from '@shared/react-contexts/game-context/game-context';
import Styles from "./loader.module.scss";

export default function Loader() {
    const gameName = useGameContext()?.gameName?.toLocaleLowerCase();
    return <div className={`${Styles["loader"]} ${Styles[gameName]}`} data-testid="loader"></div>;
}
