import {useState} from "react";
import {ethers} from "ethers";
import {Field} from "./forms/Fields";
import {QuizData} from "../models/QuizData";
const SALT = '123123123'; // Salt used in the QuizGame smart contract

export function CreateQuiz({addQuiz}) {
    const [formData, setFormData] = useState<QuizData>({question: "", answer: ""});

    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        setFormData((formData) => {
            return {...formData, [name]: value}
        })
    }

    function handleSubmit(event) {
        event.preventDefault();
        const quiz: QuizData = {
            ...formData, answer: ethers.utils.keccak256(
                ethers.utils.solidityPack(
                    ['bytes32', 'string'],
                    [ethers.utils.formatBytes32String(SALT), formData.answer]
                )
            )
        }
        addQuiz(quiz)
    }

    return (
        <div className="card-container">
            <div className="mb-3">
                <h2>Add a question and the corresponding answer</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <Field name="question" value={formData.question} onChange={handleChange}>Question</Field>
                <Field name="answer" value={formData.answer} onChange={handleChange}>Answer</Field>
                <button className="btn btn-primary btn-lg mt-4 w-100">Add Question</button>
            </form>
        </div>
    )
}
