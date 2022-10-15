const {cryptoHash} = require('../../Cryptography/index');


describe('cryptoHash()', () => {
	it('generates a SHA-256 hashed output', () => {
		expect(cryptoHash('artemis'))
			.toEqual('4cb39dad59f9d7f4964b1d649a0978547d70ac56fb7f1240ad77cba6e6efc832')
	})

	it('produces the same hash with the same input argument in any order', () => {
		expect(cryptoHash('one', 'two', 'tree'))
			.toEqual(cryptoHash('tree', 'one', 'two'))
	})

	// Make sure that the hash is not the same if the input is the same
	// Make sure the hash is unique
	it('produces a unique hash when the properties have changed on an input', () => {
		const foo = {}
		const originalHash = cryptoHash(foo)
		foo['a'] = 'a'

		expect(cryptoHash(foo)).not.toEqual(originalHash)
	});
})