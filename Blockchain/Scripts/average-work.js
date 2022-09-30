const { totalmem } = require('os');
const Blockchain = require('../Models/blockchain')
const blockchain = new Blockchain();

blockchain.addBlock({ data: 'initial' });

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;
const times = [];

console.log('first block', blockchain.chain[blockchain.chain.length - 1])

for (let i = 0; i < 10000; i++) {

    prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

    blockchain.addBlock({ data: `block ${i}` });
    nextBlock = blockchain.chain[blockchain.chain.length - 1];

    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);

    average = times.reduce((total, num) => (total, num)) / times.length;

    console.log(`Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}ms,  AverageTime : ${average}ms`);

}