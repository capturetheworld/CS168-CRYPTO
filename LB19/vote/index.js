"use strict";

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
let account;
web3.eth.getAccounts().then((f) => {
 account = f[0];
});

// Load the ABI produced by the compiler
let abi = JSON.parse('[{"constant":true,"inputs":[],"name":"getRedVotes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"votedGreen","type":"bool"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getGreenVotes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"voteGreen","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]');

// Load the contract.
let contract = new web3.eth.Contract(abi);
contract.options.address = "0xE61A256dE94Dfa8B74A1094761fb4FB7D4704531";

function vote(votedGreen) {
  contract.methods.vote(votedGreen).send({from: account}).then(updateResults);
}

function updateResults() {
  contract.methods.getGreenVotes().call().then((f) => {
    $("#greenVotes").html(f);
  });
  contract.methods.getRedVotes().call().then((f) => {
    $("#redVotes").html(f);
  });
}

// Load initial results upon loading.
updateResults();
