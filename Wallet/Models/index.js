const { STARTING_BALANCE,} = require('../../config');
const { ec, cryptoHash} = require('../../Blockchain/Cryptography/index');
const Transaction = require('./transaction');


class Wallet{
    constructor() {
        this.balance = STARTING_BALANCE;

        // PUBLIC KEY & PRIVATE KEY PAIR
        this.keyPar = ec.genKeyPair();

        this.publicKey = this.keyPar.getPublic().encode('hex');
    }

    sign(data){
        // ec.keyFromPrivate(this.publicKey).sign(data);
        return  this.keyPar.sign(cryptoHash(data));
    } 

    createTransaction({ amount, recipient }){
        // If the amount is greater than the balance, throw an error
        if(amount > this.balance){
            throw new Error('Amount exceeds balance');
        }

        // Return a new transaction instance with the wallet's public key, the recipient and amount
        return new Transaction({ senderWallet: this, recipient, amount });
    };
} 

module.exports = Wallet;