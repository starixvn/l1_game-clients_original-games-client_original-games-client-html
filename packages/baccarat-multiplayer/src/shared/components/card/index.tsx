import React from "react";
import Styles from "./card.module.scss";
import { Props } from "./type";
import { convertRank, suffixNameMapping } from "./utils/card-utils";

export const EmptyCardIndex = -1;

const cardImages: Record<string, string> = {
    A: "/static/images/baccarat/cards/A.png",
    K: "/static/images/baccarat/cards/K.png",
    Q: "/static/images/baccarat/cards/Q.png",
    J: "/static/images/baccarat/cards/J.png",
    '10': "/static/images/baccarat/cards/10.png",
    '9': "/static/images/baccarat/cards/9.png",
    '8': "/static/images/baccarat/cards/8.png",
    '7': "/static/images/baccarat/cards/7.png",
    '6': "/static/images/baccarat/cards/6.png",
    '5': "/static/images/baccarat/cards/5.png",
    '4': "/static/images/baccarat/cards/4.png",
    '3': "/static/images/baccarat/cards/3.png",
    '2': "/static/images/baccarat/cards/2.png",
    ARed: "/static/images/baccarat/cards/A-red.png",
    KRed: "/static/images/baccarat/cards/K-red.png",
    QRed: "/static/images/baccarat/cards/Q-red.png",
    JRed: "/static/images/baccarat/cards/J-red.png",
    '10Red': "/static/images/baccarat/cards/10-red.png",
    '9Red': "/static/images/baccarat/cards/9-red.png",
    '8Red': "/static/images/baccarat/cards/8-red.png",
    '7Red': "/static/images/baccarat/cards/7-red.png",
    '6Red': "/static/images/baccarat/cards/6-red.png",
    '5Red': "/static/images/baccarat/cards/5-red.png",
    '4Red': "/static/images/baccarat/cards/4-red.png",
    '3Red': "/static/images/baccarat/cards/3-red.png",
    '2Red': "/static/images/baccarat/cards/2-red.png",
    diamond: "/static/images/baccarat/cards/diamond.png",
    club: "/static/images/baccarat/cards/club.png",
    spade: "/static/images/baccarat/cards/spade.png",
    heart: "/static/images/baccarat/cards/heart.png",
};

const Card: React.FC<Props> = (props) => {
    const { result, viewMode = '' } = props;
    const customClassName = props.customClassName ?? '';

    const getCardsDefault = () => {
        const rankRed = result?.type > 1 ? '' : 'Red';
        const rankImageUrl = cardImages[`${convertRank(result?.card)}${rankRed}`];
        const suitImageUrl = cardImages[`${suffixNameMapping[result?.type]}`];
        return (
            <div className={Styles['card-front-box']}>
                <div className={Styles['card-front']}>
                    <img src={rankImageUrl} className={Styles['card-rank']} width="20" height="20" alt={`card rank ${convertRank(result?.card)}`} />
                    <img src={suitImageUrl} className={Styles['card-suit']} width="20" height="20" alt={`card suit ${suffixNameMapping[result?.type]}`} />
                </div>
            </div>
        );
    };

    if (result.card === EmptyCardIndex) {
        return null;
    }

    return (
        <div className={`${Styles[customClassName]} ${Styles['card']} `}>
            <div className={Styles['result']} data-testid="result-card">
                {getCardsDefault()}
            </div>
        </div>
    );
};

export default Card;
