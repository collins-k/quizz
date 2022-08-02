import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import {ethers} from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import QuizGameArtefact from "../contracts/QuizGame.json";
import QuizFactoryArtefact from "../contracts/QuizFactory.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
import {NoWalletDetected} from "./NoWalletDetected";
import {ConnectWallet} from "./ConnectWallet";
import {TransactionErrorMessage} from "./TransactionErrorMessage";
import {WaitingForTransactionMessage} from "./WaitingForTransactionMessage";
import {Navbar} from "./Navbar";
import {AnswerQuiz} from "./AnswerQuiz";
import {CreateQuiz} from "./CreateQuiz";
import {QuizData} from "../models/QuizData";
import {Loading} from "./Loading";
import {QuizNotFound} from "./QuizNotFound";
import {IQuiz, IState} from "../models/DappState";

// This is the Hardhat Network id that we set in our hardhat.config.js for local development.
const HARDHAT_NETWORK_ID = '1337';
const POLYGON_NETWORK_ID = '80001';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// Since window.ethereum is not recognized by the TypeScript compiler,
// we use this little hack
declare let window: any;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the QuizFactory contract
//   4. Create quizzes by sending transactions
//   5. Fetch the next available quiz
//   6. Renders the whole application
//
export class Dapp extends React.Component<{}, IState> {
    // We store multiple things in Dapp's state.
    initialState = {
        // The current quiz's contract and its metadata
        qContract: this._getInitQuizState(),
        // The user's address
        selectedAddress: undefined,
        // The ID about transactions being sent, and any possible error with them
        txBeingSent: undefined,
        transactionError: undefined,
        networkError: undefined,
    };
    // We'll use ethers to interact with the Ethereum network and our contract
    private _provider: ethers.providers.Web3Provider;
    private _quiz: any;

    constructor(props) {
        super(props);

        this.state = this.initialState;
        // We make sure that the following functions don't their context
        this.addQuiz = this.addQuiz.bind(this);
        this.loadQuestion = this.loadQuestion.bind(this);
        this._connectWallet = this._connectWallet.bind(this);
        this._initialize = this._initialize.bind(this);
        this._initializeEthers = this._initializeEthers.bind(this);
        this._dismissTransactionError = this._dismissTransactionError.bind(this);
        this._dismissNetworkError = this._dismissNetworkError.bind(this);
        this._getRpcErrorMessage = this._getRpcErrorMessage.bind(this);
        this._resetState = this._resetState.bind(this);
        this._checkNetwork = this._checkNetwork.bind(this);
        this._submitGuess = this._submitGuess.bind(this);
        this._fund = this._fund.bind(this);
        this._getInitQuizState = this._getInitQuizState.bind(this);
    }

    render() {
        // Ethereum's wallets inject the window.ethereum object. If it hasn't been
        // injected, we instruct the user to install MetaMask.
        if (window.ethereum === undefined) {
            return <NoWalletDetected/>;
        }

        if (!this.state.selectedAddress) {
            return (
                <ConnectWallet
                    connectWallet={() => this._connectWallet()}
                    networkError={this.state.networkError}
                    dismiss={() => this._dismissNetworkError()}
                />
            );
        }

        // If the Dapp hasn't loaded yet or executes transaction
        if (this.state.loading) {
            return <Loading/>;
        }

        // If everything is loaded, we render the application.
        return (
            <>
                <Navbar address={this.state.selectedAddress}
                        networkName={"Localhost 8545"}/>
                <div className="container">
                    <ul className="nav nav-tabs justify-content-center" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="quiz-tab" data-bs-toggle="tab"
                                    data-bs-target="#quiz-tab-pane"
                                    type="button" role="tab" aria-controls="quiz-tab-pane" aria-selected="true">Quiz
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link" id="create-tab" data-bs-toggle="tab"
                                    data-bs-target="#create-tab-pane"
                                    type="button" role="tab" aria-controls="create-tab-pane"
                                    aria-selected="false">Create
                                Quiz
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link" id="closed-quiz-tab" data-bs-toggle="tab"
                                    data-bs-target="#closed-quiz-tab-pane"
                                    type="button" role="tab" aria-controls="closed-quiz-tab-pane"
                                    aria-selected="false">Closed Quizzes
                            </button>
                        </li>
                    </ul>
                    {this.state.txBeingSent && (
                        <WaitingForTransactionMessage txHash={this.state.txBeingSent}/>
                    )}

                    {this.state.transactionError && (
                        <TransactionErrorMessage
                            message={this._getRpcErrorMessage(this.state.transactionError)}
                            dismiss={() => this._dismissTransactionError()}
                        />
                    )}

                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="quiz-tab-pane" role="tabpanel"
                             aria-labelledby="quiz-tab"
                             tabIndex={0}>
                            {this.state.qContract.question ?
                                <AnswerQuiz quiz={this.state.qContract} submitGuess={this._submitGuess}
                                            fund={this._fund}></AnswerQuiz>
                                : <QuizNotFound/>
                            }
                        </div>
                        <div className="tab-pane fade" id="create-tab-pane" role="tabpanel" aria-labelledby="create-tab"
                             tabIndex={1}><CreateQuiz addQuiz={this.addQuiz}/>
                        </div>
                        <div className="tab-pane fade" id="closed-quiz-tab-pane" role="tabpanel"
                             aria-labelledby="closed-quiz-tab"
                             tabIndex={2}>Closed Quiz
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /**
     * Run when the user clicks the Connect
     * connects the Dapp to the user's wallet, and initializes it
     * Check if the user is on the correct network
     * Reinitialize the Dapp whenever the user changes their account.
     */
    async _connectWallet() {
        const [selectedAddress] = await window.ethereum.request({method: 'eth_requestAccounts'});

        if (!this._checkNetwork()) {
            return;
        }

        this._initialize(selectedAddress);

        window.ethereum.on("accountsChanged", ([newAddress]) => {
            if (newAddress === undefined) {
                return this._resetState();
            }
            this._initialize(newAddress);
        });

        window.ethereum.on("chainChanged", ([networkId]) => {
            this._resetState();
        });
    }

    /**
     *  This method initialize the Dapp
     *  1 - store the user's address in the component's state
     *  2 - Initialize ethers
     *  3 - Load the next question
     * @param userAddress - The user's address
     */
    _initialize(userAddress) {
        this.setState({selectedAddress: userAddress,});
        this._initializeEthers().then();
        this.loadQuestion().then();
    }

    /**
     *  1 - This method initialize ethers
     *  2 - initialize the contract using that provider
     */
    async _initializeEthers() {
        this._provider = new ethers.providers.Web3Provider(window.ethereum);
        this._quiz = new ethers.Contract(
            contractAddress.QuizFactory,
            QuizFactoryArtefact.abi,
            this._provider.getSigner(0)
        );
    }

    /**
     * This method create a new quiz
     * @param data - question and the hashed answer
     */
    async addQuiz(data: QuizData) {
        try {
            // If a transaction fails, we save that error in the component's state.
            this._dismissTransactionError();

            // We send the transaction, and save its hash in the Dapp's state. This
            // way we can indicate that we are waiting for it to be mined.
            const tx = await this._quiz.createQuiz(data.question, data.answer);
            this.setState({txBeingSent: tx.hash});

            // We use .wait() to wait for the transaction to be mined. This method
            // returns the transaction's receipt.
            const receipt = await tx.wait();

            // The receipt, contains a status flag, which is 0 to indicate an error.
            if (receipt.status === 0) {
                throw new Error("Transaction failed");
            }
            // Load the next question
            this.loadQuestion().then();
        } catch (error) {
            // Do nothing if the user rejected the transaction
            if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
                return;
            }
            console.error(error);
            this.setState({transactionError: error});
        } finally {
            this.setState({txBeingSent: undefined});
        }
    }

    async loadQuestion() {
        this.setState({qContract: this._getInitQuizState(), loading: true})
        try {
            const questionAddresses: any[] = await this._quiz.getQuizzes();
            for (let i = 0; i < questionAddresses.length; i++) {
                let c = new ethers.Contract(
                    questionAddresses[i],
                    QuizGameArtefact.abi,
                    this._provider.getSigner(0)
                );

                const quest = await c.question();
                const solved = await c.solved();

                if (!solved) {
                    // value for answering correctly - comes as a BigNumber
                    let value = Number(ethers.utils.formatEther(await this._provider.getBalance(questionAddresses[i])))
                    const contract: IQuiz = {
                        contract: c,
                        question: quest,
                        address: questionAddresses[i],
                        balance: value,
                        isAnswerCorrect: undefined
                    }
                    this.setState({qContract: contract})
                    this.state.qContract.contract.on('QuizFunded', (b) => {
                        value = Number(ethers.utils.formatEther(b));
                        this.setState({
                            loading: false,
                            transactionError: undefined,
                            qContract: {...this.state.qContract, isAnswerCorrect: undefined, balance: value}
                        })
                    })
                    this.state.qContract.contract.on('AnswerGuessed', () => {
                        this.setState({
                            loading: false,
                            transactionError: undefined,
                            qContract: {...this.state.qContract, isAnswerCorrect: true}
                        });
                        // wait 5 sec before displaying the next question
                        setTimeout(() => {
                            this.loadQuestion();
                            this.setState({qContract: {...this.state.qContract, isAnswerCorrect: undefined}});
                        }, 5000)
                    })
                    this.state.qContract.contract.on('AnswerIncorrect', () => {
                        this.setState({
                            loading: false,
                            transactionError: undefined,
                            qContract: {...this.state.qContract, isAnswerCorrect: false}
                        });
                    })
                    break
                }
            }
        } catch (error) {
            this.setState({transactionError: error});
        } finally {
            this.setState({loading: false, txBeingSent: undefined});
        }
    }

    async _submitGuess(answer) {
        try {
            this.setState({loading: true});
            const tx = await this.state.qContract.contract.guess(answer);
            this.setState({txBeingSent: tx.hash});
        } catch (error) {
            this.setState({loading: false, transactionError: error});
        } finally {
            this.setState({txBeingSent: undefined});
        }
    }

    async _fund(funding) {
        try {
            this.setState({loading: true});
            const tx = await this._provider.getSigner(0)
                .sendTransaction({
                    to: this.state.qContract.address,
                    value: ethers.utils.parseEther(funding)
                })
            this.setState({txBeingSent: tx.hash});
        } catch (error) {
            this.setState({loading: false, transactionError: error});
        } finally {
            this.setState({txBeingSent: undefined});
        }
    }

    // This method just clears part of the state.
    _dismissTransactionError() {
        this.setState({transactionError: undefined});
    }

    // This method just clears part of the state.
    _dismissNetworkError() {
        this.setState({networkError: undefined});
    }

    // This is an utility method that turns an RPC error into a human-readable
    // message.
    _getRpcErrorMessage(error) {
        if (error.data) {
            return error.data.message;
        }

        const errorMessage = JSON.stringify(error.message).split('message');
        if (errorMessage.length >= 2) {
            return errorMessage[2].replace(/[^a-zA-Z0-9' ]/g, "");
        }

        return error.message;
    }

    // This method resets the state
    _resetState() {
        this.setState(this.initialState);
    }

    // Reset quiz contract information
    _getInitQuizState(): IQuiz {
        return {
            contract: undefined,
            address: undefined,
            balance: undefined,
            question: undefined,
            isAnswerCorrect: undefined,
        }
    }

    // This method checks if Metamask selected network is correct. Locally Localhost:8545
    _checkNetwork() {
        const network = window.ethereum.networkVersion;
        if (network === HARDHAT_NETWORK_ID || network === POLYGON_NETWORK_ID) {
            return true;
        }

        this.setState({
            networkError: 'Please select the matic mumbai testnet in your wallet'
        });
        return false;
    }
}
