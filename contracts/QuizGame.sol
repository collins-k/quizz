// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract QuizGame {
    bytes32 public constant SALT = bytes32("123123123");
    bytes32 public hashedAnswer;
    string public question;
    bool public solved;

    event QuizFunded(uint256 amount);
    event AnswerGuessed();
    event AnswerIncorrect();

    error NotFounded(string msg);

    constructor(string memory _question, bytes32 _hashedAnswer) {
        question = _question;
        hashedAnswer = _hashedAnswer;
    }

    function guess(string calldata answer) public {
        if (address(this).balance <= 0) {
            revert NotFounded("You first have to fund the quiz");
        }

        if (keccak256(abi.encodePacked(SALT, answer)) == hashedAnswer) {
            emit AnswerGuessed();
            (bool sent, bytes memory data) = payable(msg.sender).call{value : address(this).balance}("");
            require(sent, "Failed to send");
            solved = true;
        } else {
            emit AnswerIncorrect();
        }
    }

    fallback() external payable {
        emit QuizFunded(address(this).balance);
    }

    receive() external payable {
        emit QuizFunded(address(this).balance);
    }
}

