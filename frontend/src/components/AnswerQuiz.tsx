import React, { useState} from "react";
import Lottie from "react-lottie-player";
import {confetti} from "../utils";
import {formatQuestionAnswer} from "../utils/format-question-answer";

export function AnswerQuiz({quiz, submitGuess, fund}) {

    const [answer, setAnswer] = useState("");
    const [funding, setFunding] = useState(0);

    function handleChange(event) {
        quiz.isAnswerCorrect = undefined;
        setAnswer(event.target.value);
    }

    function handleFundChange(event) {
        setFunding(event.target.value);
    }

    function handleResponseSubmit(event) {
        event.preventDefault();
        submitGuess(formatQuestionAnswer(answer));
        setAnswer("");
    }

    function handleFundSubmit(event) {
        event.preventDefault();
        fund(funding);
        setFunding(0);
    }

    return (
        <div className="card-container text-center"
             style={{backgroundColor: quiz.isAnswerCorrect === false ? "#f9bec7" : quiz.isAnswerCorrect ? "#50c878" : "", position: "relative"}}>
            {
                quiz.isAnswerCorrect &&
                <div style={{position: "absolute", left: "35%"}}>
                    <Lottie
                        loop
                        animationData={confetti}
                        play
                        speed={1.5}
                        style={{width: 200, height: 200}}
                    />
                </div>
            }
            <div className="mb-4">
                <h2>{quiz.question}</h2>
                <p className="text-muted">
                    <small className="fst-italic">Balance: </small>
                    <span className="fw-semibold">{quiz.balance} ETH</span>
                </p>
            </div>
            <div className="grid gap-1 align-items-center justify-items-start mb-5">
                <input
                    type="text"
                    autoComplete="off"
                    id="answer"
                    name="answer"
                    value={answer}
                    onChange={handleChange}
                    className="form-control g-col-12 g-col-sm-9"
                />
                <button className="btn btn-primary g-col-12 g-col-sm-3" onClick={handleResponseSubmit}
                        disabled={!answer}>Submit
                </button>
            </div>
            <div className="grid gap-1 align-items-center justify-items-start">
                <label htmlFor={answer} className="g-col-12 text-muted text-start">
                    {
                        quiz.balance === 0 ?
                            "You have to fund the question before answering" :
                            "You can add some ethers to this question"
                    } </label>
                <input
                    type="number"
                    autoComplete="off"
                    id="funding"
                    name="funding"
                    value={funding}
                    onChange={handleFundChange}
                    className="form-control g-col-12 g-col-sm-9"
                />
                <button className="btn btn-primary g-col-12 g-col-sm-3" onClick={handleFundSubmit}
                        disabled={funding <= 0}>Fund
                </button>
            </div>
        </div>
    )
}
