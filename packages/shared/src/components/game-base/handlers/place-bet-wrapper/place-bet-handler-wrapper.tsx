import { useEffect } from "react";
import { usePlaceBetContext, usePlaceBetDispatch } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { PlaceBetHandler } from "..";

export type PlaceBetWrapperProps = {
    handler: PlaceBetHandler;
    signOut: any;
    children: any;
};

export const PlaceBetHandlerWrapper = (props: PlaceBetWrapperProps) => {
    const dispatch = usePlaceBetDispatch();
    const placeBetContext = usePlaceBetContext();

    useEffect(() => {
        props.handler.setPlaceBetDispatch(dispatch);
    }, []);

    useEffect(() => {
        props.handler.registerEvents(props.signOut, placeBetContext);

        return () => {
            props.handler.unregisterEvents();
        }
    }, [placeBetContext]);

    return (<>{props.children}</>);
}
