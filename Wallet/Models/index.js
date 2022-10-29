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

    createTransaction({ amount, recipient, chain }){
        
        if(chain){
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }

        // If the amount is greater than the balance, throw an error
        if(amount > this.balance){
            throw new Error('Amount exceeds balance');
        }

        // Return a new transaction instance with the wallet's public key, the recipient and amount
        return new Transaction({ senderWallet: this, recipient, amount });
    };

    static calculateBalance({chain, address}){
        let outputsTotal = 0;

        // Loop through all the blocks in the chain
        for(let i= 1; i<chain.length; i++){
            const block = chain[i];

            // Loop through all the transactions in the block
            for(let transaction of block.data){
                const addressOutput = transaction.outputMap[address];
                // If the transaction is sent to the address, add the amount to the outputsTotal
                if(addressOutput){
                    // If the transaction is sent to the address, add the amount to the outputsTotal
                    outputsTotal = outputsTotal + addressOutput
                }
            }
        }

        // Return the total amount of outputs
        return STARTING_BALANCE + outputsTotal;
    }
} 

module.exports = Wallet;