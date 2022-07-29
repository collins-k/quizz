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

// This is the Hardhat Network id that we set in our hardhat.config.js.
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '1337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

interface IState {
    selectedAddress?: string;
    question?: string;
    loading?: boolean;
    txBeingSent?: string;
    transactionError?: Error;
    networkError?: string;
}

// Since window.ethereum is not recognized by the TypeScript compiler,
// we use this little hack
declare let window: any;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the QuizFactory contract
//   3. Polls the user balance to keep it updated.
//   4. Create quizzes by sending transactions
//   5. Fetch the next available quiz
//   6. Renders the whole application
//
export class Dapp extends React.Component<{}, IState> {
    // We store multiple things in Dapp's state.
    initialState = {
        // The user's address
        selectedAddress: undefined,
        question: undefined,
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
    }

    render() {
        // Ethereum's wallets inject the window.ethereum object. If it hasn't been
        // injected, we instruct the user to install MetaMask.
        if (window.ethereum === undefined) {
            return <NoWalletDetected/>;
        }

        // The next thing we need to do, is to ask the user to connect their wallet.
        // When the wallet gets connected, we are going to save the user's address
        // in the component's state. So, if it hasn't been saved yet, we have
        // to show the ConnectWallet component.
        //
        // Note that we pass it a callback that is going to be called when the user
        // clicks a button. This callback just calls the _connectWallet method.
        if (!this.state.selectedAddress) {
            return (
                <ConnectWallet
                    connectWallet={() => this._connectWallet()}
                    networkError={this.state.networkError}
                    dismiss={() => this._dismissNetworkError()}
                />
            );
        }

        // If the token data or the user's balance hasn't loaded yet, we show
        // a loading component.
        if (this.state.loading) {
            return <Loading/>;
        }
        // If everything is loaded, we render the application.
        return (
            <>
                <Navbar address={this.state.selectedAddress}
                        networkName={"Localhost 8545"}/>
                <div className="container">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
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
                            { this.state.question ?
                                <AnswerQuiz question={this.state.question}></AnswerQuiz>
                                : <QuizNotFound/>
                            }
                        </div>
                        <div className="tab-pane fade" id="create-tab-pane" role="tabpanel" aria-labelledby="create-tab"
                             tabIndex={1}><CreateQuiz addQuiz={this.addQuiz}/>
                        </div>
                        <div className="tab-pane fade" id="closed-quiz-tab-pane" role="tabpanel"
                             aria-labelledby="closed-quiz-tab"
                             tabIndex={0}>Closed Quiz
                        </div>
                    </div>
                </div>
            </>
        );
    }

    async _connectWallet() {
        // This method is run when the user clicks the Connect. It connects the
        // dapp to the user's wallet, and initializes it.

        // To connect to the user's wallet, we have to run this method.
        // It returns a promise that will resolve to the user's address.
        const [selectedAddress] = await window.ethereum.request({method: 'eth_requestAccounts'});

        // Once we have the address, we can initialize the application.

        // First we check the network
        if (!this._checkNetwork()) {
            return;
        }

        this._initialize(selectedAddress);

        // We reinitialize it whenever the user changes their account.
        window.ethereum.on("accountsChanged", ([newAddress]) => {
            // `accountsChanged` event can be triggered with an undefined newAddress.
            // This happens when the user removes the Dapp from the "Connected
            // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
            // To avoid errors, we reset the dapp state
            if (newAddress === undefined) {
                return this._resetState();
            }

            this._initialize(newAddress);
        });

        // We reset the dapp state if the network is changed
        window.ethereum.on("chainChanged", ([networkId]) => {
            this._resetState();
        });
    }

    _initialize(userAddress) {
        // This method initializes the dapp

        // We first store the user's address in the component's state
        this.setState({
            selectedAddress: userAddress,
        });

        // Then, we initialize ethers, fetch the token's data, and start polling
        // for the user's balance.

        // Fetching the token data and the user's balance are specific to this
        // sample project, but you can reuse the same initialization pattern.
        this._initializeEthers().then();
        this.loadQuestion().then();
    }

    async _initializeEthers() {
        // We first initialize ethers by creating a provider using window.ethereum
        this._provider = new ethers.providers.Web3Provider(window.ethereum);

        // Then, we initialize the contract using that provider and the token's
        // artifact. You can do this same thing with your contracts.
        this._quiz = new ethers.Contract(
            contractAddress.QuizFactory,
            QuizFactoryArtefact.abi,
            this._provider.getSigner(0)
        );
    }

    // This method sends an ethereum transaction to transfer tokens.
    // While this action is specific to this application, it illustrates how to
    // send a transaction.
    async addQuiz(data: QuizData) {
        // Sending a transaction is a complex operation:
        //   - The user can reject it
        //   - It can fail before reaching the ethereum network (i.e. if the user
        //     doesn't have ETH for paying for the tx's gas)
        //   - It has to be mined, so it isn't immediately confirmed.
        //     Note that some testing networks, like Hardhat Network, do mine
        //     transactions immediately, but your dapp should be prepared for
        //     other networks.
        //   - It can fail once mined.
        //
        // This method handles all of those things, so keep reading to learn how to
        // do it.

        try {
            // If a transaction fails, we save that error in the component's state.
            // We only save one such error, so before sending a second transaction, we
            // clear it.
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
                // We can't know the exact error that made the transaction fail when it
                // was mined, so we throw this generic one.
                throw new Error("Transaction failed");
            }
            // Load the next question
            this.loadQuestion().then();

            // If we got here, the transaction was successful, so you may want to
            // update your state. Here, we update the user's balance.
        } catch (error) {
            // We check the error code to see if this error was produced because the
            // user rejected a tx. If that's the case, we do nothing.
            if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
                return;
            }

            // Other errors are logged and stored in the Dapp's state. This is used to
            // show them to the user, and for debugging.
            console.error(error);
            this.setState({transactionError: error});
        } finally {
            // If we leave the try/catch, we aren't sending a tx anymore, so we clear
            // this part of the state.
            this.setState({txBeingSent: undefined});
        }
    }

    async loadQuestion() {
        this.setState({question: undefined, loading: true})
        const questionAddresses: any[] = await this._quiz.getQuizzes();

        for (let i = 0; i < questionAddresses.length; i++) {
            let qContract = new ethers.Contract(
                questionAddresses[i],
                QuizGameArtefact.abi,
                this._provider.getSigner(0)
            );
            const quest = await qContract.question();
            const solved = await qContract.solved();
            if (!solved) {
                this.setState({question: quest})
                break
            }
        }
        this.setState({loading: false})
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

        return JSON.stringify(error.message).split('message')[2].replace(/[^a-zA-Z0-9' ]/g, "");
    }

    // This method resets the state
    _resetState() {
        this.setState(this.initialState);
    }

    // This method checks if Metamask selected network is Localhost:8545
    _checkNetwork() {
        if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
            return true;
        }

        this.setState({
            networkError: 'Please connect Metamask to Localhost:8545'
        });

        return false;
    }
}
