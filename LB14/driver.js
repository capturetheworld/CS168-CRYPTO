"use strict";

const { Blockchain, Block, Miner, Client, Transaction, FakeNet } = require('spartan-gold');

const PoolOperator = require('./pool-operator.js');
const PoolMiner = require('./pool-miner.js');

console.log("Starting simulation.  This may take a moment...");

let fakeNet = new FakeNet();

// Clients
let alice = new Client({name: "Alice", net: fakeNet});
let bob = new Client({name: "Bob", net: fakeNet});
let charlie = new Client({name: "Charlie", net: fakeNet});

// Independent miners
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});
let donald = new Miner({name: "Donald", net: fakeNet});

// Mining Pool operator and miners
let poolNet = new FakeNet();
let snowWhite = new PoolOperator({name: "Snow White", net: fakeNet, poolNet: poolNet});
let doc = new PoolMiner({name: "Doc", net: fakeNet, operatorAddress: snowWhite.address});
let happy = new PoolMiner({name: "Happy", net: fakeNet, operatorAddress: snowWhite.address});
let sneezy = new PoolMiner({name: "Sneezy", net: fakeNet, operatorAddress: snowWhite.address});
let sleepy = new PoolMiner({name: "Sleepy", net: fakeNet, operatorAddress: snowWhite.address});
let bashful = new PoolMiner({name: "Bashful", net: fakeNet, operatorAddress: snowWhite.address});
let grumpy = new PoolMiner({name: "Grumpy", net: fakeNet, operatorAddress: snowWhite.address});
let dopey = new PoolMiner({name: "Dopey", net: fakeNet, operatorAddress: snowWhite.address});

poolNet.register(snowWhite, doc, happy, sneezy, sleepy, bashful, grumpy, dopey);

let clientBalanceMap = new Map([
  [alice, 233],
  [bob, 99],
  [charlie, 67],
  [minnie, 300],
  [mickey, 300],
  [donald, 300],
  [snowWhite, 300],
  [doc, 300],
  [happy, 300],
  [sneezy, 300],
  [sleepy, 300],
  [bashful, 300],
  [grumpy, 300],
  [dopey, 300],
]);

// Creating genesis block
Blockchain.makeGenesis({
  blockClass: Block,
  transactionClass: Transaction,
  clientBalanceMap: clientBalanceMap,
  powLeadingZeroes: 19,
});

function showBalances(client) {
  for (let cl of clientBalanceMap.keys()) {
    console.log(`${cl.name} has ${client.lastBlock.balanceOf(cl.address)} gold.`);
  }
}

// Showing the initial balances from Alice's perspective, for no particular reason.
console.log("Initial balances:");
showBalances(alice);

for (let client of clientBalanceMap.keys()) {
  console.log(`Registering ${client.name}`);
  fakeNet.register(client);
}

// Mining pool initializes
snowWhite.startNewSearch();

// Miners start mining.
for (let client of clientBalanceMap.keys()) {
  if (client.initialize !== undefined) {
    client.initialize();
  }
}

// Alice transfers some money to Bob.
console.log(`Alice is transferring 40 gold to ${bob.address}`);
alice.postTransaction([{ amount: 40, address: bob.address }]);

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

setTimeout(showFinalBalances, 7000);