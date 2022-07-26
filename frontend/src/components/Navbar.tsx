import * as React from "react";

export const Navbar = (props: { address: string; networkName: string; }) => {
    const {address, networkName} = props;

    const getFormattedAddress = () => {
        const firstPart = address?.slice(0, 6)
        const lastPart = address?.slice(-6)
        return `${firstPart}...${lastPart}`
    }

    return (
        <div className='d-md-flex d-lg-flex justify-content-between align-items-md-center px-4 py-3' style={{ background: "#5358FD"}}>
            <div
                className='d-flex d-md-block d-lg-block mb-2 mb-md-0 mb-lg-0 justify-content-around align-items-md-center text-white'>
                <p className='mb-0 pr-2'><small>Connected to:</small> <strong>{ networkName }</strong></p>
            </div>
            <div className='text-center'>
                <span className='d-inline-block bg-light px-2 py-1 rounded-pill'>{getFormattedAddress()}</span>
            </div>
        </div>
    )
};

