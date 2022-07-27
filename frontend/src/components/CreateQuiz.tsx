import {useState} from "react";
import {Field} from "./forms/Fields";
import {FormData} from "../models/FormData";

export function CreateQuiz({}) {
    const [formData, setFormData] = useState<FormData>({question: "", response: ""});

    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        setFormData((formData) => {
            return { ...formData, [name]: value }
        })
    }

    function handleSubmit(event) {
        event.preventDefault();
        console.log("form", formData)
    }
    return (
        <div className="card-container">
            <div className="mb-3">
                <h2>Add a question and the corresponding answer</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <Field name="question" value={formData.question} onChange={handleChange}>Question</Field>
                <Field name="response" value={formData.response} onChange={handleChange}>Response</Field>
                <button className="btn btn-primary btn-lg mt-4 w-100">Add Question</button>
            </form>
        </div>
    )
}
