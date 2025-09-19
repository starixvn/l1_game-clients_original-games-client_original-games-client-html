import React from "react";
import Styles from "./card.module.scss";
import { Props } from "./type";
import { convertRank, suffixNameMapping } from "./utils/card-utils";

export const EmptyCardIndex = -1;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const cardImages: Record<string, string> = {
    A: `${basePath}/static/images/baccarat/cards/A.png`,
    K: `${basePath}/static/images/baccarat/cards/K.png`,
    Q: `${basePath}/static/images/baccarat/cards/Q.png`,
    J: `${basePath}/static/images/baccarat/cards/J.png`,
    '10': `${basePath}/static/images/baccarat/cards/10.png`,
    '9': `${basePath}/static/images/baccarat/cards/9.png`,
    '8': `${basePath}/static/images/baccarat/cards/8.png`,
    '7': `${basePath}/static/images/baccarat/cards/7.png`,
    '6': `${basePath}/static/images/baccarat/cards/6.png`,
    '5': `${basePath}/static/images/baccarat/cards/5.png`,
    '4': `${basePath}/static/images/baccarat/cards/4.png`,
    '3': `${basePath}/static/images/baccarat/cards/3.png`,
    '2': `${basePath}/static/images/baccarat/cards/2.png`,
    ARed: `${basePath}/static/images/baccarat/cards/A-red.png`,
    KRed: `${basePath}/static/images/baccarat/cards/K-red.png`,
    QRed: `${basePath}/static/images/baccarat/cards/Q-red.png`,
    JRed: `${basePath}/static/images/baccarat/cards/J-red.png`,
    '10Red': `${basePath}/static/images/baccarat/cards/10-red.png`,
    '9Red': `${basePath}/static/images/baccarat/cards/9-red.png`,
    '8Red': `${basePath}/static/images/baccarat/cards/8-red.png`,
    '7Red': `${basePath}/static/images/baccarat/cards/7-red.png`,
    '6Red': `${basePath}/static/images/baccarat/cards/6-red.png`,
    '5Red': `${basePath}/static/images/baccarat/cards/5-red.png`,
    '4Red': `${basePath}/static/images/baccarat/cards/4-red.png`,
    '3Red': `${basePath}/static/images/baccarat/cards/3-red.png`,
    '2Red': `${basePath}/static/images/baccarat/cards/2-red.png`,
    diamond: `${basePath}/static/images/baccarat/cards/diamond.png`,
    club: `${basePath}/static/images/baccarat/cards/club.png`,
    spade: `${basePath}/static/images/baccarat/cards/spade.png`,
    heart: `${basePath}/static/images/baccarat/cards/heart.png`,
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
                <div className={Styles['card-front']} style={{ backgroundImage: `url(${basePath}/static/images/baccarat/cards/card-front.svg)` }}>
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
