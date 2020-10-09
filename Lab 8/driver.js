"use strict";

const MerkleTree = require('./merkle.js').MerkleTree;
const utils = require('./utils.js');

function test (mt, tx) {
  if (mt.contains(tx)) {
    let path = mt.getPath(tx);
    console.log("PATH:");
    console.log(path);
    console.log(`The path provided ${mt.verify(tx, path) ? "is" : "is **not**"} valid for ${tx}.`);
  } else {
    console.log(`Sorry, transaction ${tx} is not in the Merkle tree.`);
  }
  console.log();
}


let mt = new MerkleTree(["a","b","c","d","e","f","g","h"]);

test(mt, "c");
test(mt, "d");
test(mt, "f");
test(mt, "h");

// Corrupting an element of the hash
mt.hashes[2] = utils.hash("satoshi");

// Should be caught as invalid.
test(mt, "c");

// Should still be OK, since the corrupted position is not part of its path.
test(mt, "h");

mt.display();