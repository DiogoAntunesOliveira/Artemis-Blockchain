const hexToBinary = require('hex-to-binary');
const hexTobinary = require('hex-to-binary')
const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../Cryptography/crypto-hash")

class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        const lastHash = lastBlock.hash;
        let hash, timestamp;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp: Date.now(),
            lastHash: lastBlock.hash,
            data: data,
            difficulty: difficulty,
            nonce: nonce,
            hash: hash
        })
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;

        const difference = timestamp - originalBlock.timestamp;

        if (difference > MINE_RATE) {
            return difficulty - 1
        };

        if (difficulty < 1) return 1;

        return difficulty + 1;
    }

}

module.exports = Block;

/*const block1 = new Block({
    timestamp : '01/01/01',
    lastHash : 'foo-lastHash',
    hash :  'foo-hash',
    data : 'foo-data'
});
console.log('block1', block1);*/

// <<cryptography>> -> chain sha/foo -> 256 bits
// <<result>> -> hexadecimal 64 bits