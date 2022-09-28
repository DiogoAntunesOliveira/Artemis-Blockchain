const bodyParser = require('body-parser')
const express = require("express")
const Blockchain = require("./Models/blockchain")

const app = express()
const blockchain = new Blockchain()

// User body parser to accept json on body
app.use(bodyParser.json())

app.get('/api/blocks', (request, response) => {
    response.json(blockchain.chain)
})

app.post('/api/mine', (req, res) => {
    const { data } = req.body

    blockchain.addBlock({ data })

    res.redirect('/api/blocks')
})

const PORT = 3000;
app.listen(PORT, () => console.log(`listening at localhost: ${PORT}`))