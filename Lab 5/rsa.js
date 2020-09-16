"use strict";

let modular = require('./modularDivision.js');

function encrypt(message, pubKey) {
  let ciphertext = message ** pubKey.e % pubKey.modulus;
  return ciphertext;
}

function decrypt(ciphertext, privKey) {
  let message = ciphertext ** privKey.d % privKey.modulus;
  return message;
}

function sign(message, privKey) {
  return decrypt(message, privKey);
}

function verify(message, sig, pubKey) {
  let m = encrypt(sig, pubKey);
  return m === message;
}

function blind(message,pubKey){
	let blindedmessage = message * blindingFactor**pubKey.e % pubKey.modulus;
  return blindedmessage;

}

function unblind(s_prime,pubKey){
	let signed = modDivide(blindSig, blindingFactor, pubKey.modulus);
  return signed;

}
// Setting up key pair
let mod = 33;
let pub = { modulus: mod, e: 3 };
let priv = { modulus: mod, d: 7 };
let b = 0;

// Choose any message less than the modulus.
let m = 18;
let c = encrypt(m, pub);
console.log(`${m} encrypted returns ${c}`);
let m1 = decrypt(c, priv);
console.log(`${c} decrypted returns ${m1}`);
console.log();

// Signing now -- note that it is a bad idea to
// use the same key pair for signing and encrypting,
// but the math works out just fine.
m = 24;
let m_prime = blind(m,pub);
let sig_prime = sign(m_prime, priv);
console.log(`${m} signed returns signature ${sig}`);
let s = unblind(sig_prime);
let v = verify(sig_prime, sig, pub);
console.log(`${sig} ${v ? "is" : "is not" } a valid signature for ${m}`);


