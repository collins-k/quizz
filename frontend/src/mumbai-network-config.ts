export const getMumbaiNetworkConfig = () => {
    return [{
        chainId: "0x13881",
        rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
        chainName: "Matic Mumbai",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18
        },
        blockExplorerUrls: ["https://polygonscan.com/"]
    }]
}
