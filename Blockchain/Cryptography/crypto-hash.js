const crypto = require('crypto')
const hexTobinary = require('hex-to-binary')

const cryptoHash = (...inputs) => {
	const hash = crypto.createHash('sha256')
	hash.update(inputs.sort().join(' '))
	//hash.digest('hex')
	//return hexTobinary(hash.digest('hex'))
	return hash.digest('hex')
}

module.exports = cryptoHash