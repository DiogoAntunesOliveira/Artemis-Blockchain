const bodyParser = require('body-parser')
const { response } = require('express')
const express = require("express")
const request = require("request")
const Blockchain = require("./Blockchain/Models/blockchain")
const PubSub = require('./Blockchain/Redis/pubsub')
const TransactionPool = require('./Wallet/Models/transaction-pool')
const Wallet = require('./Wallet/Models/index')

const app = express()
const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new PubSub({ blockchain })

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`


// setTimeout(() => pubsub.broadcastChain(), 1000)

// User body parser to accept json on body
app.use(bodyParser.json())

app.get('/api/blocks', (request, response) => {
    response.json(blockchain.chain)
})

app.post('/api/mine', (req, res) => {
    const { data } = req.body

    blockchain.addBlock({ data })

    pubsub.broadcastChain()

    res.redirect('/api/blocks')
})


app.post('/api/transaction', (req, res) => {
    const { amount, recipient } = req.body;

    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey })

    console.log('transactionPool', transactionPool);

    // Check if transaction exists on transactionPool
    try {
        if(transaction){
            transaction.update({ senderWallet: wallet, recipient, amount })
        } else {
            transaction = wallet.createTransaction({ recipient, amount })
        }
    } catch (error) {
        return res.status(400).json({ type: 'error', message: error.message })
    }

    

    // Set Transaction
    transactionPool.setTransaction(transaction);

    console.log('transactionPool', transactionPool);
    res.json({ type: 'success', transaction });
});


const syncChains = () => {
    request({url : `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if(!error && response.statusCode === 200){
            const rootChain = JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain)
        }
    })
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening at localhost: ${PORT}`)
    if(PORT !== DEFAULT_PORT) {
        syncChains()
    }
})
 