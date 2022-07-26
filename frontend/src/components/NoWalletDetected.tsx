import React from "react";
import {CardInfoModel} from "../models/CardInfoModel";
import {CardInfo} from "./card/CardInfo";

export function NoWalletDetected() {
    const cardInfo: CardInfoModel = {
        title: "No Ethereum wallet was detected.",
        description: "We recommend the MetaMask wallet",
        buttonText: "Install MetaMask"
    }

    const _onMetamaskInstall = () => {
        window.open("http://metamask.io", '_blank');
    }
    return (
        <CardInfo connectWallet={() => _onMetamaskInstall()} cardInfo={cardInfo}/>
    );
}
