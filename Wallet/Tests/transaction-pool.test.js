const TransactionPool = require('../Models/transaction-pool');
const Transaction = require('../Models/transaction');
const Wallet = require('../Models/index');

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
        });
    });

    // Set up a transaction 
    describe('setTransaction()', () => {
        // Add a transaction to the pool
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            // Expect the transaction to be in the pool
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
            // Set 
            transactionPool.setTransaction(transaction);

            // Expect the transaction to be in the pool
            expect(
                transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
            ).toBe(transaction);
        });
    });
});
