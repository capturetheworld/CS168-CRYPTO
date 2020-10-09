"use strict";

const { Blockchain, Block, Client, Miner, Transaction, FakeNet } = require('spartan-gold');

const UtxoClient = require('./utxo-client.js');

/**
 * In Part 1, we only represent a single UTXO client "ulysses".
 * The goal of this portion is to test out the client's
 * ability to create addresses and summarize the total
 * amount of UTXOs and total gold in the client's wallet.
 * 
 * The remainder of the classes use the standard SpartanGold
 * implementations, including the other clients.
 * 
 * Note that Ulysses is aware of his total amount of gold.
 * However, Alice is unaware of which accounts belong to Ulysses.
 * This design was Bitcoin's (fairly weak) attempt to provide
 * some degree of anonymity.
 */

console.log("Starting simulation.  This may take a moment...");

let fakeNet = new FakeNet();

// Clients
let alice = new Client({name: "Alice", net: fakeNet});
let bob = new Client({name: "Bob", net: fakeNet});
let charlie = new Client({name: "Charlie", net: fakeNet});

// "Special" client that produces a new public key for each transaction.
// This design is how the UTXO model works in Bitcoin.
let ulysses = new UtxoClient({name: "Ulysses", net: fakeNet});

// Miners
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: Block,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [alice, 233],
    [bob, 99],
    [charlie, 67],
    [ulysses, 10],
    [minnie, 200],
    [mickey, 200],
  ]),
});

function showBalances(client) {
  console.log();
  console.log(`Alice's balance is ${alice.availableGold}.`);
  console.log(`Bob's balance is ${bob.availableGold}.`);
  console.log(`Charlie's balance is ${charlie.availableGold}.`);

  console.log();
  console.log(`Ulysses's total balance is ${ulysses.availableGold}.`);
  ulysses.showAllUtxos();

  console.log();
  console.log("Showing all UTXOs for ${client.name}");
  client.showAllBalances();
}

// Showing the initial balances from Alice's perspective, for no particular reason.
console.log("Initial balances:");
showBalances(alice);

fakeNet.register(alice, bob, charlie, ulysses, minnie, mickey);

// Miners start mining.
minnie.initialize();
mickey.initialize();

// Alice transfers some money to Bob.
let addr = ulysses.createAddress();
console.log();
console.log(`***Alice is transferring 40 gold to Ulysses at address ${addr}`);
console.log();
alice.postTransaction([{ amount: 40, address: addr }]);

setTimeout(() => {
  let addr = ulysses.createAddress();
  console.log();
  console.log(`***Alice is transferring 30 gold to Ulysses at address ${addr}`);
  console.log();
  alice.postTransaction([{ amount: 30, address: addr }]);
}, 2000);


// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log();
  showBalances(alice);

  process.exit(0);
}, 5000);
