"use strict";

const Mnemonic = require('./mnemonic.js').Mnemonic;

let m = new Mnemonic();
console.log(m.wordlist[0]);
console.log(m.wordlist[42]);

let words = m.words();

console.log(words);

let m2 = new Mnemonic(words);
console.log(`The new mnemonic ${ m2.isValid() ? "is valid" : "is NOT valid"}.`);

console.log(`m ${ m.seq.equals(m2.seq) ? "===" : "!==" } m2`);

console.log();
console.log("With this mnemonic:");
console.log(`  no passphrase gives a seed of ${m.generateSeed()}`);
let p = "Satoshi";
console.log(`  the passphrase "${p}" gives a seed of ${m.generateSeed(p)}`);
p = "Call me Ishamel."
console.log(`  the passphrase "${p}" gives a seed of ${m.generateSeed(p)}`);
