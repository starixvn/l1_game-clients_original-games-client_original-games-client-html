// Plinko Game Page Component
// This is the main entry point for the Plinko game in the monorepo

import React from "react";
import { GameStateProvider, useGameStatesDispatch } from "@shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "@shared/react-hooks";
import { InitSocketIO } from "@shared/helpers";
import { GameMessageHandler } from "@shared/components/game-base/handlers";
import PlinkoGame from "./components/plinko-game/PlinkoGame";
import { logger } from "./services/logger";

class PlinkoGameComponent extends React.Component<any, any> {
    componentDidMount() {
        // Initialize socket connection using shared InitSocketIO
        const gameMessageHandler = new GameMessageHandler(() => { }); // Simple dispatch for plinko
        const socketInfo = {
            namespace: 'plinko',
            path: 'plinko'
        };

        // Use session from props or create a default one
        const session = this.props.session || {
            username: 'plinko-user',
            ss: 'default-session'
        };

        logger.info('Initializing Plinko socket connection', { socketInfo, session });
        InitSocketIO(socketInfo, session, 'Plinko', gameMessageHandler);
    }

    render() {
        return <PlinkoGame {...this.props} />;
    }
}

const PlinkoWrapper = (props) => {
    return (
        <GameStateProvider>
            <PlinkoFC {...props} />
        </GameStateProvider>
    );
};

const PlinkoFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <PlinkoGameComponent
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: null, // Plinko doesn't need complex game state
                translate: t,
                tolgeeNamespace,
            }}
        />
    );
};

export default PlinkoWrapper;
