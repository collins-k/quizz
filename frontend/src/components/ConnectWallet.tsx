import React from "react";
import {NetworkErrorMessage} from "./NetworkErrorMessage";
import {identity} from "../utils";
import {CardInfo} from "./card/CardInfo";
import {CardInfoModel} from "../models/CardInfoModel";

export function ConnectWallet({connectWallet, networkError, dismiss}) {
    const cardInfo: CardInfoModel = {
        animation: identity,
        title: "Connect your wallet",
        description: "To begin, please connect your Metamask wallet",
        buttonText: "Connect Metamask"
    }
    console.log(networkError)
    return (
        <div>
            <div className="text-center">
                {/* Metamask network should be set to Localhost:8545. */}
                {networkError && (
                    <NetworkErrorMessage
                        message={networkError}
                        dismiss={dismiss}
                    />
                )}
            </div>
            <CardInfo connectWallet={connectWallet} cardInfo={cardInfo} upAnimation={true}/>
        </div>
    );
}
