"use strict";

const { Transaction, Block, Blockchain, Miner, Client, FakeNet } = require('spartan-gold');
const SelfishMiner = require('./selfish-miner');

console.log("Starting simulation.  This may take a moment...");

let fakeNet = new FakeNet();

// Clients
let alice = new Client({name: "Alice", net: fakeNet});
let bob = new Client({name: "Bob", net: fakeNet});
let charlie = new Client({name: "Charlie", net: fakeNet});

// Miners.
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Selfish miner.
let maleficent = new SelfishMiner({name: "Maleficent", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: Block,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [alice, 233],
    [bob, 99],
    [charlie, 67],
    [minnie, 0],
    [mickey, 0],
    [maleficent, 0],
  ]),
  powLeadingZeroes: 16,
});


function showBalances(client) {
  console.log(`Alice has ${client.lastBlock.balanceOf(alice.address)} gold.`);
  console.log(`Bob has ${client.lastBlock.balanceOf(bob.address)} gold.`);
  console.log(`Charlie has ${client.lastBlock.balanceOf(charlie.address)} gold.`);
  console.log(`Minnie has ${client.lastBlock.balanceOf(minnie.address)} gold.`);
  console.log(`Mickey has ${client.lastBlock.balanceOf(mickey.address)} gold.`);
  console.log(`Maleficent has ${client.lastBlock.balanceOf(maleficent.address)} gold.`);
}

// Showing the initial balances from Alice's perspective, for no particular reason.
console.log("Initial balances:");
showBalances(alice);

fakeNet.register(alice, bob, charlie, minnie, mickey, maleficent);

// Maleficent gets a head start.
maleficent.initialize();

setTimeout(() => {
  console.log('Starting additional miners.')
  minnie.initialize();
  mickey.initialize();
}, 8000);

// Alice transfers some money to Bob.
console.log(`Alice is transferring 40 gold to ${bob.address}`);
alice.postTransaction([{ amount: 40, address: bob.address }]);


// Print out the final balances after it has been running for some time.
let showCurrentBalances = function() {

  // Keep going if you have not made many blocks yet.
  //if (minnie.currentBlock.chainLength < 10) {
  //  setTimeout(showFinalBalances, 2000);
  //  return;
  //}

  console.log();
  console.log("============================================");

  console.log("Balances (Minnie's perspective):");
  showBalances(minnie);
  console.log("........................");
  console.log("Balances (Maleficent's perspective):");
  showBalances(maleficent);

  console.log("============================================");
  console.log();

  //process.exit(0);
}

setInterval(showCurrentBalances, 5000);