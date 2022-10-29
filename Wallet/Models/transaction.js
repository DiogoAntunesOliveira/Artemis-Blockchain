const uuid = require('uuid/v1');
const { verifySignature } = require('../../Blockchain/Cryptography/index');
const { REWARD_INPUT, MINING_REWARD } = require('../../config')

class Transaction {
    constructor({ senderWallet, recipient, amount, outputMap, input }) {
        this.id = uuid();
        this.outputMap =  outputMap || this.createOutputMap({ senderWallet, recipient, amount });
        this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
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

    static rewardTransaction({ minerWallet }) {
        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: MINING_REWARD }
        });
    }

    update({ senderWallet, recipient, amount }) {
        // If the amount is greater than the sender's balance, throw an error
        if (amount > this.outputMap[senderWallet.publicKey]) {
          throw new Error('Amount exceeds balance');
        }
    
        // If the recipient is already in the outputMap, add the amount to the existing amount
        if (!this.outputMap[recipient]) {
          this.outputMap[recipient] = amount;
        } else {
          this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }
    
        // Subtract the amount from the sender's balance
        this.outputMap[senderWallet.publicKey] =
          this.outputMap[senderWallet.publicKey] - amount;
    
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
      }
    
}

module.exports = Transaction;