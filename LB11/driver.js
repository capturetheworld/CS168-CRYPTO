"use strict";

const {
  Logger,
  ALL,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
  OFF,
} = require('./logger.js');


let logger = new Logger(ALL);

// Testing out each of the logging levels.
logger.debug('icky');
logger.info('hello');
logger.warn("Something doesn't feel right here...");
logger.error("Ouch!");
logger.fatal("Oh dear god no...  RUN!!!");

// Writing a bunch of messages
for (let i=0; i<40; i++) {
  let logLevel = (i % 5) + 1;
  logger.log(`Message ${i}`, logLevel)
}

console.log("Displaying blockchain:");
logger.displayBlockchain();
 
// Quick utility function to test the blockchain
function testBC() {
  if (logger.verifyBlockchain()) {
    console.log("The blockchain has not been tampered with.");
  } else {
    console.log("WARNING!!! The logs have been modified.");
  }
  console.log();
}

console.log();
console.log("Initial validation.");
testBC();

// Messing with a message in the blockchain.
let blockHashes = Object.keys(logger.bc.blocks);
let block = logger.bc.blocks[blockHashes[1]];
let time = block.transactions[2].time;
block.transactions[2] = {
  message: "Pay no mind to this log message.  Nothing happened at this time.",
  time: time,
  logLevel: "DEBUG",
};

console.log("Validating blockchain after tampering with a message in one of the blocks.");
testBC();

console.log(`Initially, block proof ${ block.verifyProof() ? "is" : "is NOT"} valid.`);
// Looking for a new proof.
delete block.proof;
block.findProof();
console.log(`After mining, block proof ${ block.verifyProof() ? "is" : "is NOT"} valid.`);

console.log();
console.log("Validating blockchain after finding a new proof for the tampered block.  (This should still fail).");
testBC();
