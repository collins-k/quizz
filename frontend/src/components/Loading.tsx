import React from "react";
import Lottie from "react-lottie-player";
import {loader} from "../utils";

export function Loading() {
    return (
        <div className="d-flex">
            <div className="mx-auto mt-5">
                <Lottie
                    loop
                    animationData={loader}
                    play
                    speed={2.5}
                    style={{width: 200, height: 200}}
                />
            </div>
        </div>
    );
}
