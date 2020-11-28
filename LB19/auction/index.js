"use strict";

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
let account;
web3.eth.getAccounts().then((f) => {
 account = f[0];
});

// Load the ABI produced by the compiler
let abi = JSON.parse('[{"inputs":[],"name":"getHighBidder","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopBid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"uint256","name":"bid","type":"uint256"}],"name":"makeBid","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

// Load the contract.
let contract = new web3.eth.Contract(abi);
contract.options.address = "0x46AdC94a8F035f2CE71FD5b55CFD6c1330ab7093";

function makeBid() {
  let bid = parseInt($("#bid").val());
  let bidder = parseInt($("#bidder").val(), 16);
  contract.methods.makeBid(true).send({name:bidder,bid:bid});
}

function updateResults() {
  contract.methods.getTopBid().call((_, bids) => {
		$("highBid").val("The current high bid is" + bids);
	});
}

// Load initial results upon loading.
updateResults();
