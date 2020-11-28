"use strict";

const { Transaction, Blockchain, Client, FakeNet } = require('spartan-gold');

// Swapping out the Block, Miner, Client, and Blockchain implementations.
const Block = require('./nonoutsourceable-block');
const Miner = require('./nonoutsourcing-miner');

let oldDeserialize = Blockchain.deserializeBlock;
Blockchain.deserializeBlock = function(o) {
  let block = oldDeserialize.call(this, o);

  // Adding extra fields needed for nonoutsourceable blocks.
  block.sig1 = o.sig1;
  block.sig2 = o.sig2;
  block.pubKey = o.pubKey;

  return block;
}

console.log("Starting simulation.  This may take a moment...");

let fakeNet = new FakeNet();

// Clients
let alice = new Client({name: "Alice", net: fakeNet});
let bob = new Client({name: "Bob", net: fakeNet});
let charlie = new Client({name: "Charlie", net: fakeNet});

// Miners.
// Note that we do fewer rounds and lower the PoW target due to the extra
// work required to find a proof when we integrate digital signatures.
let minnie = new Miner({name: "Minnie", net: fakeNet, miningRounds: 500});
let mickey = new Miner({name: "Mickey", net: fakeNet, miningRounds: 500});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: Block,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [alice, 233],
    [bob, 99],
    [charlie, 67],
    [minnie, 300],
    [mickey, 300],
  ]),
  powLeadingZeroes: 13,
});

function showBalances(client) {
  console.log(`Alice has ${client.lastBlock.balanceOf(alice.address)} gold.`);
  console.log(`Bob has ${client.lastBlock.balanceOf(bob.address)} gold.`);
  console.log(`Charlie has ${client.lastBlock.balanceOf(charlie.address)} gold.`);
  console.log(`Minnie has ${client.lastBlock.balanceOf(minnie.address)} gold.`);
  console.log(`Mickey has ${client.lastBlock.balanceOf(mickey.address)} gold.`);
}

// Showing the initial balances from Alice's perspective, for no particular reason.
console.log("Initial balances:");
showBalances(alice);

fakeNet.register(alice, bob, charlie, minnie, mickey);

// Miners start mining.
minnie.initialize();
mickey.initialize();

// Alice transfers some money to Bob.
console.log(`Alice is transferring 40 gold to ${bob.address}`);
alice.postTransaction([{ amount: 40, address: bob.address }]);

// Print out the final balances after it has been running for some time.
// Print out the final balances after it has been running for some time.
let showFinalBalances = function() {

  // Keep going if you have not made many blocks yet.
  if (minnie.currentBlock.chainLength < 10) {
    setTimeout(showFinalBalances, 2000);
    return;
  }

  console.log();
  console.log(`Minnie has a chain of length ${minnie.currentBlock.chainLength}:`);

  console.log();
  console.log("Final balances (Minnie's perspective):");
  showBalances(minnie);

  process.exit(0);
}

setTimeout(showFinalBalances, 7000);;