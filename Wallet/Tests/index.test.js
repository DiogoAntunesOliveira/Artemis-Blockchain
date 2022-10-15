const Wallet = require("../Models/index");
const {verifySignature} = require("../../Blockchain/Cryptography/index");
const Transaction = require("../Models/transaction");
const Blockchain = require("../../Blockchain/Models/blockchain");

describe('Wallet', () => {
    let wallet;
    
    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        console.log(wallet.publicKey);
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        // User who have created elliptic
        // indutny/elliptic

        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });  
    });

    describe('createTransaction()', () => {

        // The amount of the transaction exceeds the balance of the wallet
        describe('and the amount exceeds the balance', () => {
            it('throws an error', () => {
                // Expect the function to throw an error if the amount is greater than the balance
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' }))
                    .toThrow('Amount exceeds balance');
            });
        });

        // The amount of the transaction is valid
        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            // Before each test, create a transaction
            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({ amount, recipient });
            });
            
            // The transaction is created
            it('creates an instance of `Transaction`', () => {
                // Expect the transaction to be an instance of Transaction
                expect(transaction instanceof Transaction).toBe(true);
            });

            // The transaction's outputMap matches the wallet's balance
            it('matches the transaction input with the wallet', () => {
                // Expect the transaction's input to have the same address as the wallet's publicKey
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });
            
            // Outputs the amount the recipient
            it('outputs the amount the recipient', () => {
                // Expect the transaction's outputMap to have the same amount as the recipient
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        // describe('and a chain is passed', () => {
        //     it('calls `Wallet.calculateBalance`', () => {
        //         const calculateBalanceMock = jest.fn();

        //         const originalCalculateBalance = Wallet.calculateBalance;

        //         Wallet.calculateBalance = calculateBalanceMock;

        //         wallet.createTransaction({
        //             recipient: 'foo',
        //             amount: 10,
        //             chain: new Blockchain().chain
        //         });

        //         expect(calculateBalanceMock).toHaveBeenCalled();

        //         Wallet.calculateBalance = originalCalculateBalance;
        //     });
        // });
    });


})