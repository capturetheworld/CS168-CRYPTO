"use strict";

const { Blockchain, Block, Client, Miner, Transaction, FakeNet } = require('spartan-gold');

const BuggyBlock = require('./buggyBlock.js');

console.log("Starting simulation.  This may take a moment...");


let fakeNet = new FakeNet();

// Clients
let alice = new Client({name: "Alice", net: fakeNet});
let belle = new Client({name: "Belle", net: fakeNet});
let cinderella = new Client({name: "Cinderella", net: fakeNet});

// Miners
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Malicious client
let maleficent = new Client({name: "Maleficent", net: fakeNet});

// Maleficent listens for transactions where she receives a reward
// so that she can replay them later.
maleficent.on(Blockchain.POST_TRANSACTION, (tx) => {
  //
  // ***YOUR CODE HERE***
  //
  // If one of the transaction's outputs is to maleficent's address,
  // save the transaction.  (You only need to do this the first time
  // that you see the transaction).
  for (let out in tx.outputs){
    if(tx.output[out].address === maleficient.address){
      maleficient.stored = tx;
    }

  }

});

maleficent.on(Blockchain.PROOF_FOUND, (receiveBlock) => {

  if(receiveBlock.rewardAddr === maleficent.stored.from){
    fakeNet.broadcast(Blockchain.POST_TRANSACTION, maleficent.stored); //if detected broadcast
  }

}

// Maleficent listens for Minnie to broadcast a new block,
// and then attempts to steal her reward.
//
// Add a listener on maleficent for when a miner discovers a proof.
// If the block reward is being given to minnie, rebroadcast the saved
// transaction so that maleficent can steal the reward.
//



// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: BuggyBlock,
  transactionClass: Transaction,
  powLeadingZeroes: 14,
  clientBalanceMap: new Map([
    [alice, 133],
    [belle, 99],
    [cinderella, 67],
    [minnie, 100],
    [mickey, 100],
    [maleficent, 10],
  ]),
});

function showBalances(client) {
  console.log("====================");
  console.log(`Alice has ${client.lastBlock.balanceOf(alice.address)} gold.`);
  console.log(`Belle has ${client.lastBlock.balanceOf(belle.address)} gold.`);
  console.log(`Cinderella has ${client.lastBlock.balanceOf(cinderella.address)} gold.`);
  console.log(`Minnie has ${client.lastBlock.balanceOf(minnie.address)} gold.`);
  console.log(`Mickey has ${client.lastBlock.balanceOf(mickey.address)} gold.`);
  console.log(`Maleficent has ${client.lastBlock.balanceOf(maleficent.address)} gold.`);
  console.log("====================");
}

// Showing the initial balances from Alice's perspective, for no particular reason.
console.log("Initial balances:");
showBalances(alice);

fakeNet.register(alice, belle, cinderella, minnie, mickey, maleficent);

// Miners start mining.
minnie.initialize();
mickey.initialize();

// Alice transfers some money to Belle.
console.log(`Alice is transfering 40 gold to ${belle.address}`);
alice.postTransaction([{ amount: 40, address: belle.address }]);

// Minnie transfers some money to Maleficent.
console.log(`Minnie is transfering 25 gold to ${maleficent.address}`);
minnie.postTransaction([{ amount: 25, address: maleficent.address }]);

// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log();
  console.log("Final balances (Minnie's perspective):");
  showBalances(minnie);
  process.exit(0);
}, 5000);
