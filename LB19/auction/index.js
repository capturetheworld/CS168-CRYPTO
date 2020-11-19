"use strict";

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
let account;
web3.eth.getAccounts().then((f) => {
 account = f[0];
});

// Load the ABI produced by the compiler
let abi = JSON.parse('*** PASTE ABI HERE ***');

// Load the contract.
let contract = new web3.eth.Contract(abi);
contract.options.address = "*** REPLACE WITH THE CONTRACT ADDRESS ***";

function makeBid() {
  let bid = parseInt($("#bid").val());
  // ***YOUR CODE HERE***
  // Get the bidder (converting to hex), and then call
  // the makeBid function from your smart contract.
}

function updateResults() {
  // ***YOUR CODE HERE***
}

// Load initial results upon loading.
updateResults();
