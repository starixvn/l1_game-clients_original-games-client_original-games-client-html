import { useEffect, useState } from "react";
import {
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../_shared/helpers/message-transmitter/global-transmitter";
import HeaderTitle from "./header-title";
import Styles from "./header.module.scss";
import Setting from "./setting";
import { UserInfo } from "./user-info";
const Header = () => {
    const [openingGameId, setOpeningGameId] = useState(0);

    useEffect(() => {
        const gameScriberId = registerGlobalMessageEvent(GlobalTransmitterEvent.OPEN_GAME_ID, ({ openingGameId }) => {
            setOpeningGameId(openingGameId);
        });

        return () => {
            unsubscribeGlobalMessageEvent(gameScriberId);
        };
    }, []);

    const isRenderGames = openingGameId > 0;
    return (
        <header className={`${Styles.header}`} data-testid="header">
            <div className="game-container flex">
                <div className={Styles["header-container"]}>
                    <HeaderTitle isRenderGames={isRenderGames} openingGameId={openingGameId} />
                    <div className={Styles["header-right"]}>
                        <UserInfo isLobby={!isRenderGames} />
                        <Setting />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
