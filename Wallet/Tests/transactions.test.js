const Transaction = require('../Models/transaction');
const Wallet = require('../Models/index');
const { verifySignature } = require('../../Blockchain/Cryptography');

describe('Transaction', () => {

    // Create a transaction
    // senderWallet -> wallet who is sending the money
    // recipient -> wallet who is receiving the money
    // amount -> amount of money to be sent
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;

        transaction = new Transaction({ senderWallet, recipient, amount });
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });


    describe('input', () => {
        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('sets the `amount` to the `senderWallet` balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the `senderWallet` publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true);
            // expect(typeof transaction.input.signature).toEqual('object');
            // expect(transaction.input.signature).toEqual(senderWallet.sign(transaction.outputMap));
        });
    });

    describe('validTransaction()', () => {

        let errorMock;

        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
        });

        describe('when the transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });

        describe('when the transaction is invalid', () => {

            describe('and a transaction outputMap value is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 999999;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction input signature is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.input.signature = new Wallet().sign('data');
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
    });

    // Update the transaction with new data and return the updated transaction
    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        // The amount of the transaction exceeds the balance of the wallet
        describe('and the amount is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({
                        senderWallet, recipient: 'foo', amount: 999999
                    });
                }).toThrow('Amount exceeds balance');
            });
        });

        // The amount of the transaction is valid
        describe('and the amount is valid', () => {

            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;

                // Update the transaction with new data and return the updated transaction  before each test
                transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount });
            });

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            it('subtracts the amount from the original senderWallet balance', () => {
                // Expect the original senderWallet balance to be equal to the original senderWallet balance minus the next amount
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - amount);
            });

            it('maintains a total output that matches the input amount', () => {
                // Expect the total output to be equal to the original senderWallet balance
                expect(
                    Object.values(transaction.outputMap)
                        .reduce((total, outputAmount) => total + outputAmount)
                ).toEqual(transaction.input.amount);
            });

            // Check if the transaction is updated
            it('re-signs the transaction', () => {
                // Expect the transaction input signature to be equal to the original signature
                expect(transaction.input.signature).toEqual(senderWallet.sign(transaction.outputMap));
            });

            describe('another update for the same recipient', () => {
                let addedAmount = 80;

                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({ senderWallet, recipient: nextRecipient, amount: addedAmount });
                });

                it('adds to the recipient amount', () => {
                    // Expect the transaction output map next recipient to be equal to the next amount plus the added amount
                    expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
                });

                it('subtracts the amount from the original senderWallet balance', () => {
                    // Expect the transaction output map senderWallet ...
                    // ... public key to be equal to the original senderWallet balance minus the next amount minus the added amount
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount);
                });
            });

        });

    });
}); 