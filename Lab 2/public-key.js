"use strict";

let crypto = require('crypto');
let keypair = require('keypair');

const SIG_ALG = 'RSA-SHA256';

class CertificateAuthority {
  constructor() {
    this.certs = {};
  }

  // Register certificate for specified ID.
  // (We'll assume some validation process already happened).
  add(id, pubkey) {
    this.certs[id] = pubkey;
  }

  // Returns certificate for specified ID.
  lookup(id) {
    return this.certs[id];
  }
}

// Sign the "message" field of an object.
// Store the signature in a "sig" field on that object.
function sign(o, privKey) {
 
  const sign = crypto.createSign(SIG_ALG);
  sign.write('some data to sign');
  sign.end();
  const signature = sign.sign(privKey, 'hex');
  o.sig = signature;
}

// Verify the signature on an object signed with the 'sign'
// function that you implemented.  Get the id from the object
// to look up the appropriate public key.
function verifySignature(o) {
 const verify = crypto.createVerify(SIG_ALG);
verify.write('some data to sign');
verify.end();
console.log(verify.verify(ca.lookup(o.id), o.sig, 'hex'));
return (verify.verify(ca.lookup(o.id), o.sig, 'hex'));
}

let ca = new CertificateAuthority();


// Using the keypair library to generate public/private key pairs
let alice = keypair();
ca.add('alice', alice.public);

let o = {
  message: 'hello world!',
  id: 'alice',
};

// Sign o with Alice's private key,
// adding the signature to a 'sig' field on the object.
sign(o, alice.private);

console.log(o.sig);

console.log("Does 1st verification pass? " + verifySignature(o));

// Tampering with object.
o.message = 'hell0 world!';
console.log("Does 2nd verification pass? " + verifySignature(o));



