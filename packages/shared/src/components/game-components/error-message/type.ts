import { ResourceTypes } from '@shared/merged/_shared/resources';

export interface Props {
    message: string | string[];
    closeModal: Function;
}

export const ConnectFailedReasonKey = {
    lostConnection: `${ResourceTypes.COMMON}.message_lost_game_connection`,
    restrictPlayPermission: `${ResourceTypes.COMMON}.game_excluded`,
};
