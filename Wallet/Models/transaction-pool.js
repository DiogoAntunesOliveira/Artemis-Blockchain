class TransactionPool {
    constructor() {
        // Map of transactions
        this.transactionMap = {};
    }

    // Set a transaction
    setTransaction(transaction) {
        // Add the transaction to the map by its id
        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    // Get a transaction
    existingTransaction({ inputAddress }) {
        // Get all the transactions
        const transactions = Object.values(this.transactionMap);

        // Find the transaction with the input address
        return transactions.find(transaction => transaction.input.address === inputAddress);
    }
}

module.exports = TransactionPool;