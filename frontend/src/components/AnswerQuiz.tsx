import {Field} from "./forms/Fields";
import {useEffect, useState} from "react";

export function AnswerQuiz({question}) {

    const [response, setResponse] = useState("");

    function handleChange(event) {
        setResponse(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        console.log(response)
    }

    return (
        <div className="card-container text-center">
            <div className="mb-3">
                <h2>{question}</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <Field name="Response" value={response} onChange={handleChange}></Field>
            </form>
        </div>
    )
}
