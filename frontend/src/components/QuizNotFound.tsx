import React from "react";
import Lottie from "react-lottie-player";
import {notfound} from "../utils";

export function QuizNotFound()  {
    return (
        <div className="card-container">
                <div className="animation">
                    <Lottie
                        loop
                        animationData={notfound}
                        play
                        speed={1}
                        style={{width: 200, height: 200}}
                    />
                </div>
            <h3>No open quiz was found On-Chain</h3>
            <p>Please create a new quiz</p>
        </div>
    )
}
