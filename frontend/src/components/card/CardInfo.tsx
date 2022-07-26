import React from "react";
import Lottie from "react-lottie-player";

import {CardInfoModel} from "../../models/CardInfoModel";
import './card.css';
import {identity, up} from "../../utils";

export function CardInfo({connectWallet, cardInfo, upAnimation = false}) {
    const card: CardInfoModel = cardInfo;
    return (
        <div className="onboard-container">
            <div className="animation">
                <Lottie
                    loop={false}
                    animationData={identity}
                    play
                    speed={1}
                    style={{width: 200, height: 200}}
                />
            </div>
            { upAnimation &&
                <div className="up">
                    <Lottie
                        loop
                        animationData={up}
                        play
                        speed={1}
                        style={{width: 150, height: 150}}
                    />
                </div>
            }
            <h3>{card.title}</h3>
            <p className="desc"> {card.description}</p>
            <button className="btn btn-primary btn-onboard"
                    onClick={connectWallet}> {card.buttonText}
            </button>
        </div>
    )
}
