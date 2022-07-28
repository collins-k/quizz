// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import "./QuizGame.sol";

contract QuizFactory {
    QuizGame[] public quizzes;
    uint256 nextIndex;

    event QuizCreated(QuizGame indexed quiz);

    constructor() {}

    function createQuiz(string memory question, bytes32 answer) public {
        QuizGame quiz = new QuizGame(question, answer);
        quizzes.push(quiz);
        emit QuizCreated(quiz);
    }

    function getQuiz() public view returns (QuizGame) {
        return quizzes[nextIndex];
    }

    function getQuizzes() public view returns (QuizGame[] memory) {
        return quizzes;
    }
}
