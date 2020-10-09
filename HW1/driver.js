"use strict";

const Bank = require('./bank.js').Bank;
const Client = require('./client.js').Client;
const { Coin, COIN_RIS_LENGTH, IDENT_STR, BANK_STR } = require('./coin.js');

let bank = new Bank();

// The customer
let alice = new Client('Alice');
bank.registerClient(alice);
bank.deposit({
    account: alice.name,
    amount: 200,
});

// The merchant
let bob = new Client('Bob');
bank.registerClient(bob);
bank.deposit({
    account: bob.name,
    amount: 50,
});


// Show the starting balances.
console.log("Starting balances:");
bank.showBalances();
console.log();

// For simplicity, we'll assume that there is only one coin.
alice.buyCoin(bank, 20);

// Alice saves the coin for double-spending later
let coin = alice.coin;

// Normal transaction.
alice.giveCoin(bob);
bob.redeemCoin(bank);

console.log("Balances after 1st coin:");
bank.showBalances();
console.log();

// Alice attempts to double-spend the coin with bob.
alice.coin = coin;
alice.giveCoin(bob);
bob.redeemCoin(bank);

console.log("Balances after Alice's attempt to double-spend:");
bank.showBalances();
console.log();

// A second normal transaction.
alice.buyCoin(bank, 50);
alice.giveCoin(bob);
// Bob tracks the coin and RIS to redeem again later.
let secondCoin = bob.coin;
let ris = bob.ris;
bob.redeemCoin(bank);

console.log("Balances after 2nd coin spent:");
bank.showBalances();
console.log();

// Bob attempts to double-redeem the 2nd coin.
bob.coin = secondCoin;
bob.ris = ris;
bob.redeemCoin(bank);

console.log("Balances after 2nd coin spent:");
bank.showBalances();
console.log();


// Alice attempts to use a coin that has not been signed by the bank.
let forgedCoin = new Coin("PuddinTame", 100, bank.n, bank.e);
this.coin = forgedCoin;
try {
  alice.giveCoin(bob);
} catch (e) {
  console.log("Bob rejects the forged coin.");
  console.log();
}

// Alice attempts to redeem the forged coin with the bank
try {
  alice.redeemCoin(bank);
} catch (e) {
  console.log("The bank rejects the forged coin.");
  console.log();
}

console.log("Balances after forgery attempts:");
bank.showBalances();
console.log();
