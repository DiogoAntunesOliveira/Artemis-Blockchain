const Transaction = require('./transaction')

class TransactionPool {
    constructor() {
        // Map of transactions
        this.transactionMap = {};
    }

    clear() {
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

    // Get valid transactions
    validTransactions() {
        return Object.values(this.transactionMap).filter(
          transaction => Transaction.validTransaction(transaction)
        );
      }

    // Clear the transactions
    clearBlockchainTransactions({ chain }) {
        // Start at one to skip the genesis block
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];

            // Loop through the transactions
            for (let transaction of block.data) {
                // If the transaction is in the pool
                if (this.transactionMap[transaction.id]) {
                    // Delete the transaction
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;