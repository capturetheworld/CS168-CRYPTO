"use strict";

const utils = require('./utils.js');
const Prover = require('./prover.js').Prover;



let prover = new Prover(20);

function test(s) {
  let t1 = utils.getTime();
  let proof = prover.findProof(s);
  let t2 = utils.getTime();
  let totalTime = t2 - t1;

  console.log(`Proof for ${s} is ${proof}, requiring ${prover.numLeadingZeroes} zeroes.  Found in ${t2-t1}ms.`);
  console.log(`h(${s+proof}) = ${utils.hash(s+proof)}`);
  console.log(`Proof ${prover.verifyProof(s,proof) ? "is" : "is **NOT**"} valid.`);
  console.log();
}

// First, a simple test to verify that an invalid proof is rejected.
if (prover.verifyProof('hello', 'fffff')) {
  throw new Error("Invalid proof accepted");
}

test('hello');
test('goodbye');
test('satoshi');

// Increasing difficulty
prover.numLeadingZeroes++;
test('hello');
test('goodbye');
test('satoshi');

// Increasing difficulty
prover.numLeadingZeroes++;
test('hello');
test('goodbye');
test('satoshi');

// Increasing difficulty
prover.numLeadingZeroes++;
test('hello');
test('goodbye');
test('satoshi');


