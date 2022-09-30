const hexToBinary = require('hex-to-binary')
const CryptoHash = require('../../Cryptography/crypto-hash')
const Blockchain = require('../blockchain')
const Block = require('../block')
const cryptoHash = require('../../Cryptography/crypto-hash')

describe('Blockchain', () => {
	let blockchain, newChain, originalChain;

	// for each test new variable
	beforeEach(() => {
		blockchain = new Blockchain()
		newChain = new Blockchain();
		originalChain = blockchain.chain
	})

	it('contains a chain new Array intance', () => {
		expect(blockchain.chain instanceof Array).toBe(true)
	})

	it('starts with the genesis block', () => {
		expect(blockchain.chain[0]).toEqual(Block.genesis())
	})

	it('Adds a new block to the chain', () => {
		const newData = 'foo bar'
		blockchain.addBlock({ data: newData })

		expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData)
	})

	describe('isValidChain()', () => {

		describe('when the chain does not start with genesis block', () => {
			it('returns false', () => {
				blockchain.chain[0] = { data: 'fake genesis' }

				expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
			})
		})

		describe('when the chain starts with the genesis block and has multiple', () => {
			beforeEach(() => {

				blockchain.addBlock({ data: 'Quinn' })
				blockchain.addBlock({ data: 'Valor' })
				blockchain.addBlock({ data: 'Luxary' })

			})
			describe('and a lastHash reference as changed', () => {
				it('returns false', () => {

					blockchain.chain[2].lastHash = 'broken-lastHash'
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)

				})
			})

			describe('contains a block with an invalid field', () => {
				it('returns false', () => {

					blockchain.chain[2].lastHash = 'broken-lastHash'
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
				})
			})

			describe('and the chains contains a block with a jumped difficulty', () => {
				it('returns false', () => {

					const lastBlock = blockchain.chain[blockchain.chain.length - 1];
					const lastHash = lastBlock.hash
					const timestamp = Date.now()
					const nonce = 0
					const data = []

					const difficulty = lastBlock.difficulty - 3

					const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data)

					const badBlock = new Block(timestamp, lastHash, hash, difficulty, data)

					blockchain.chain.push(badBlock)

					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
				})

			})

			describe('and the chain does not contain any invalid blocks', () => {
				it('returns true', () => {
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
				})
			})
		})


	})

	describe('replaceChain()', () => {

		let errorMock, logMock;

		beforeEach(() => {
			errorMock = jest.fn()
			logMock = jest.fn()

			global.console.error = errorMock;
			global.console.log = logMock;
		})

		describe('when the new chain is not longer', () => {

			beforeEach(() => {
				newChain.chain[0] = { new: 'chain' }
				blockchain.replaceChain(newChain.chain)
			})


			it('does not replace the chain', () => {
				expect(blockchain.chain).toEqual(originalChain)
			})

			it('logs an error', () => {
				expect(errorMock).toHaveBeenCalled();
			})
		})

		describe('when the new chain is longer', () => {

			beforeEach(() => {
				newChain.addBlock({ data: 'Quinn' })
				newChain.addBlock({ data: 'Valor' })
				newChain.addBlock({ data: 'Luxary' })
			})

			describe('and the chain is invalid', () => {

				beforeEach(() => {
					newChain.chain[2].hash = "some-fake-hash"
					blockchain.replaceChain(newChain.chain)
				})

				it('does not replace the chain', () => {
					expect(blockchain.chain).toEqual(originalChain)
				})

				it('logs an error', () => {
					expect(errorMock).toHaveBeenCalled();
				})
			})

			describe('and the chain is valid', () => {

				beforeEach(() => {
					blockchain.replaceChain(newChain.chain)
				})

				it('replaces the chain', () => {
					expect(blockchain.chain).toEqual(newChain.chain)
				})

				it('logs about chain replacement', () => {
					expect(logMock).toHaveBeenCalled();
				})
			})

		})

	})
})