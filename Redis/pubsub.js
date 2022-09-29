const redis = require('redis')
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub {
    constructor({blockchain}) {
        this.blockchain = blockchain;

        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()

        this.subscriber.subscribe(CHANNELS.TEST)
        this.subscriber.subscribe(CHANNELS.BLOCKCHAIN)

        this.subscribeToChannels()



        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage(channel, message)
        );
    }
    handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`)

        const parsedMessage = JSON.parse(message);

        // Replace the chain if a longer and a valid one is received as a message on blockchain channel
        if(channel = CHANNELS.BLOCKCHAIN){
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
    publish({channel, message}){
        this.publisher.publish(channel, message);
    }

    // Take care of first behavior
    broadcastChain(){
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }
}

// const testPubSub = new PubSub()
// testPubSub.publisher.publish(CHANNELS.TEST, 'foo')

module.exports = PubSub;