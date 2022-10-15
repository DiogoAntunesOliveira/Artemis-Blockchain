const { STARTING_BALANCE,} = require('../../config');
const { ec, cryptoHash} = require('../../Blockchain/Cryptography/index');


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
} 

module.exports = Wallet;