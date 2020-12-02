const EC = require('elliptic').ec;
const secp256k1 = new EC('secp256k1');
const secureRandom = require('secure-random');
const base58 = require('bs58')
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');



function generatePrivateKey() {
	return secureRandom.randomBuffer(32).toString('hex');
}

function publicKeyToAddress(pubKey) {
	let hash = sha256(Buffer.from(pubKey, 'hex'));
	let pubKeyHash = new ripemd160().update(Buffer.from(hash, 'hex')).digest();
	var step1 = Buffer.from("61" + pubKeyHash.toString('hex'), 'hex');
	var step2 = sha256(step1);
	var step3 = sha256(Buffer.from(step2, 'hex'));
	var checksum = step3.substring(0, 8);
	var step4 = step1.toString('hex') + checksum;
	var address = base58.encode(Buffer.from(step4, 'hex'));
	return address;
}

function privateKeyToPublicKey(privKey) {
	let privKeyBuffer = Buffer.from(privKey, 'hex');
	let keyPair = secp256k1.keyFromPrivate(privKeyBuffer);
	let pubKey = keyPair.getPublic('hex');
	return pubKey;
}

function privateKeyToAddress(privKey) {
	let pubKey = privateKeyToPublicKey(privKey);
	let address = publicKeyToAddress(pubKey);
	return address;
}

function signData(data, privKey) {
	let keyPair = secp256k1.keyFromPrivate(privKey);
	let signature = keyPair.sign(data);
	return [signature.r.toString(16), signature.s.toString(16)];
}

function decompressPublicKey(pubKeyCompressed) {
	let pubKeyX = pubKeyCompressed.substring(0, 64);
	let pubKeyYOdd = parseInt(pubKeyCompressed.substring(64));
	let pubKeyPoint = secp256k1.curve.pointFromX(pubKeyX, pubKeyYOdd);
	return pubKeyPoint;
}

function verifySignature(data, publicKey, signature) {
	let pubKeyPoint = Buffer.from(publicKey, 'hex');
	let keyPair = secp256k1.keyPair({ pub: pubKeyPoint });
	let valid = keyPair.verify(data, { r: signature[0], s: signature[1] });
	return valid;
}
function createPrivateKeyWIF(privateKey) {
  const step1 = Buffer.from("80" + privateKey, 'hex');
  const step2 = sha256(step1);
  const step3 = sha256(Buffer.from(step2, 'hex'));
  const checksum = step3.substring(0, 8);
  const step4 = step1.toString('hex') + checksum;
  const privateKeyWIF = base58.encode(Buffer.from(step4, 'hex'));
  return privateKeyWIF;
}



module.exports = {
	generatePrivateKey,
	publicKeyToAddress,
	privateKeyToPublicKey,
	privateKeyToAddress,
	signData,
	verifySignature,
};
//global.cryptoUtils = module.exports;