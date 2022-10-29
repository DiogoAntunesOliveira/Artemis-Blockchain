const redis = require('redis')
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub {
    constructor({ blockchain, transactionPool }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool

        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()

        this.subscribeToChannels()

        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage(channel, message)
        );
    }
    handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`)

        const parsedMessage = JSON.parse(message);

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    })
                })
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage)
                break;
            default:
                return;
        }

        // Replace the chain if a longer and a valid one is received as a message on blockchain channel
        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage)
        }
    }


    // Take care of auto subscribe of blockchains
    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        })
    }

    // Send a message over a designated channel
    publish({ channel, message }) {

        // Unsubscribe before the publish
        this.subscriber.unsubscribe(channel, () => {
            // Publish the message
            this.publisher.publish(channel, message, () => {
                // Re-subscribe the channel
                this.subscriber.subscribe(channel)
            });
        });
    }

    // We can only send strings over the channels
    // Take care of first behavior
    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }


    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

// const testPubSub = new PubSub()
// testPubSub.publisher.publish(CHANNELS.TEST, 'foo')

module.exports = PubSub;