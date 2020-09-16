"use strict";

const { Client, XFER } = require('./client.js');

const net = require('./fakeNet.js');

// Alice is the first client -- she starts with a special ledger.
let alice = new Client('Alice', net);
alice.ledger = {
  'Alice': 400,
};
alice.clients = {
  'Alice': alice.keypair.public,
};

// Bob and Charlie join the network.
let bob = new Client('Bob', net);
let charlie = new Client('Charlie', net);

// Alice gives Bob and Charlie some funds.
alice.give('Bob', 150);
alice.give('Charlie', 75);
bob.give('Charlie', 15);
console.log();

// Trudy joins the network.
let trudy = new Client('Trudy', net);

alice.showLedger();
bob.showLedger();
charlie.showLedger();
trudy.showLedger();
console.log();

// Trudy tries to spend money that she does not have.
trudy.give('Bob', 150);
console.log();

// Trudy attempts to forge a message to steal Alice's funds.
let msg = {
  from: 'Alice',
  to: 'Trudy',
  amount: 175,
}
net.broadcast(XFER, { message: msg });
console.log();

alice.showLedger();
bob.showLedger();
charlie.showLedger();
trudy.showLedger();
