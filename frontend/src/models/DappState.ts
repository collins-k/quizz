export interface IState {
    selectedAddress?: string;
    qContract?: IQuiz;
    loading?: boolean;
    txBeingSent?: string;
    transactionError?: Error;
    networkError?: string;
}

export interface IQuiz {
    contract?: any,
    address?: string,
    question?: string,
    balance?: number,
    isAnswerCorrect?: any,
}
