const uuid = require('uuid/v1');
const { verifySignature } = require('../../Blockchain/Cryptography/index');

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuid();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        
        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }
    
    static validTransaction(transaction) {
        // Construct a new outputMap from the transaction's outputMap
        const { input: { address, amount, signature }, outputMap } = transaction;

        // Reduces the outputMap to the total amount of the transaction
        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);

        // verify that the amount of the transaction is equal to the amount of the sender's wallet
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        // verify that the signature is valid
        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }

        return true;
    }

    update({ senderWallet, recipient, amount }) {

        this.outputMap[recipient] = amount;
        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });

        // // Check if the amount is greater than the sender's balance
        // if (amount > this.outputMap[senderWallet.publicKey]) {
        //     throw new Error('Amount exceeds balance');
        // }

        // // Check if the recipient already exists in the outputMap
        // if (this.outputMap[recipient]) {
        //     this.outputMap[recipient] = this.outputMap[recipient] + amount;
        // } else {
        //     this.outputMap[recipient] = amount;
        // }

        // // Deduct the amount from the sender's balance
        // this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;

        // Re-sign the transaction
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    };
}

module.exports = Transaction;