const cryptoHash = require('../../Cryptography/crypto-hash')


describe('cryptoHash()', () => {
	it('generates a SHA-256 hashed output', () => {
		expect(cryptoHash('phoenix'))
			.toEqual('03a8f0dd8edb33781a836ac497800b5f9c5c47c2ddbfd0f89581140589725a85')
	})

	it('produces the same hash with the same input argument in any order', () => {
		expect(cryptoHash('one', 'two', 'tree'))
			.toEqual(cryptoHash('tree', 'one', 'two'))
	})
})