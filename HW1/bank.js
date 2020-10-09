"use strict";

const blindSignatures = require('blind-signatures');

const {
    Coin,
    COIN_RIS_LENGTH,
    IDENT_STR,
    BANK_STR,
    NUM_COINS_REQUIRED
} = require('./coin.js');
const utils = require('./utils.js');

// This class represents a bank issuing DigiCash-lite coins.
class Bank {
    constructor() {
        this.key = blindSignatures.keyGeneration({
            b: 2048
        });
        this.ledger = {};
        this.coinDB = {}; // tracks previously redeemed coins
    }

    // Returns the modulus used for digital signatures.
    get n() {
        return this.key.keyPair.n.toString();
    }

    // Returns the e value used for digital signatures.
    get e() {
        return this.key.keyPair.e.toString();
    }

    // Prints out the balances for all of the bank's customers.
    showBalances() {
        console.log(JSON.stringify(this.ledger));
    }

    // Initializes a client's account with 0 value.
    registerClient(client) {
        this.ledger[client.name] = 0;
    }

    // Updates the ledger to account for money submitted directly to the bank.
    deposit({account,amount}) {
        if (this.ledger[account] === undefined) {
            throw new Error(`${account} is not a registered customer of the bank`);
        }
        this.ledger[account] += amount;
    }

    // Updates the ledger to account for money withdrawn directly from the bank.
    withdraw({account,amount}) {
        if (this.ledger[account] === undefined) {
            throw new Error(`${account} is not a registered customer of the bank`);
        }
        if (this.ledger[account] < amount) {
            throw new Error("Insufficient funds");
        }
        this.ledger[account] -= amount;
    }

    // Returns the balance for the specified account.
    balance(account) {
        if (this.ledger[account] === undefined) {
            throw new Error(`${account} is not a registered customer of the bank`);
        }
        return this.ledger[account];
    }

    // Transfers money between 2 of the bank's customers.
    transfer({
        from,
        to,
        amount
    }) {
        if (this.ledger[from] === undefined) {
            throw new Error(`${from} is not a registered customer of the bank`);
        }
        if (this.ledger[to] === undefined) {
            throw new Error(`${to} is not a registered customer of the bank`);
        }
        let fromBalance = this.ledger[from];
        if (fromBalance < amount) {
            throw new Error(`${from} does not have sufficient funds`);
        }
        this.ledger[from] = fromBalance - amount;
        this.ledger[to] += amount;
    }

    // Verifies that a bank customer has sufficient funds for a transaction.
    verifyFunds({
        account,
        amount
    }) {
        if (this.ledger[account] === undefined) {
            throw new Error(`${account} is not a registered customer of the bank`);
        }
        let balance = this.ledger[account];
        return balance >= amount;
    }

    // This method represents the bank's side of the exchange when a user buys a coin.
    sellCoin(account, amount, coinBlindedHashes, response) {

        if (coinBlindedHashes.length !== NUM_COINS_REQUIRED) {
            throw new Error("Client hasn't prepared the right number of coins");
        } //1) Verify that the user prepared the right number of coins.

        let selectedNum = utils.randInt(coinBlindedHashes.length); //2) Randomly select a coin.

        //3) Call the 'response' callback function with the selected number.
        let [blindingFactors, coins] = response(selectedNum);

        // console.log("COINS" + blindingFactors);

        // for(let factor in blindingFactors){
        //  console.log(blindingFactors[factor] + "\n");
        //  console.log(selectedNum);
        // }

        let blindingFactorsSansSelected = blindingFactors.slice();
        blindingFactorsSansSelected[selectedNum] = undefined;

        let coinsSansSelected = coins.slice();
        coinsSansSelected[selectedNum] = undefined;



        for (let coin in coinsSansSelected) {
            if (coinsSansSelected[coin] !== undefined) {
                // let verify = coinsSansSelected[coin].verifyUnblinded(blindingFactorsSansSelected[coin]);
                if (!coinsSansSelected[coin].verifyUnblinded(blindingFactorsSansSelected[coin])) {
                    console.log(`A coin does not match its blinding factor`);
                }
                // The coin matches its blinding factor

                // That each pair of identity strings matches up with the purchaser's identity
                for (let i = 0; i < COIN_RIS_LENGTH; i++) {

                    let identStr = utils.decryptOTP({
                        key: coinsSansSelected[coin].leftIdent[i],
                        ciphertext: coinsSansSelected[coin].rightIdent[i],
                        returnType: "string",
                    });

                    if (!identStr.startsWith("IDENT")) {
                        //console.log("UMMM:   " + coinsSansSelected[coin].IDENT_STR);
                        //console.log("WE ARE HERE:    " + identStr.split(':')[1]);
                        throw new Error("can't match purchaser's identity");
                    } //does it match purchaser's id

                }
            }
        }

        // If all coins seem valid, deduct money from the purchaser's account, 
        this.withdraw({account,amount});

        //sign the blinded hash

        //and return it to the user.
        return blindSignatures.sign({
            blinded: coinBlindedHashes[selectedNum],
            key: this.key,
        });


    }

    // Adds a coin to a user's bank account.
    redeemCoin({account,coin,ris}) {

        //When a client attempts to redeem a coin, first verify that the coin has been signed by the bank.  
        //The coin's signature should be stored in a 'signature' property of the coin object.  
        //The signature should match the coin's string representation (which you can get from calling `coin.toString()`).


        let cs = coin.toString();

        let valid = blindSignatures.verify({
            unblinded: coin.signature,
            N: coin.n,
            E: coin.e,
            message: cs,
        });

        // console.log(coin.signature);
        // console.log(cs +"  this is CS!!!!!!!!!!!!!!!!!!!");
        if (!valid) {
            throw new Error('Invalid signature');
        } else if (cs === coin.signature || coin.signature === undefined) {
            throw new Error('Invalid signature 2');
        }

        // Every coin should have a GUID stored in its 'guid' property.  

        let coinGUID = coin.guid;

        //If the coin has not been received previously, accept the coin and update the redeemer's balance.
        if (this.coinDB[coinGUID] === undefined) {
            this.deposit({account,amount:coin.amount});
            this.coinDB[coinGUID] = ris;
            console.log(`Coin #${coinGUID} has been redeemed.  Have a nice day.`);
        }
        // On the other hand, if the coin has been received previously, determine who cheated.
        else {
            console.log(`Coin ${coinGUID} previously spent.  Determining cheater.`);

            let cheater = undefined;
            for (let i = 0; i < ris.length; i++) {
              // console.log("KEY LENGTH" + ris[i].length);
              // console.log("cipher LENGTH" + coinGUID[i].length);

                let identStr = utils.decryptOTP({
                    key: ris[i],
                    ciphertext: this.coinDB[coinGUID][i],
                    returnType: "string"
                });

                //If the coin purchaser cheated, print out the identity of the cheater. 
                if (identStr.startsWith(IDENT_STR)) {
                    cheater = identStr.split(':')[1];
                    console.log(`${cheater} double spent coin ${coin.guid}.`);
                    break;
                }
            }
            //Otherwise, identify the redeemer as the cheater.
            if (cheater === undefined) {
                console.log("The merchant tried to redeem the coin twice");
            }
            // As with DigiCash, DCL will use random identity strings (RISs) to identify the cheater.  
            //When accepting a coin, you must keep the RIS to identify cheaters in future double-spend attempts.
            console.log(`Sorry, but coin #${coinGUID} cannot be accepted.`);




        }


    }
}


exports.Bank = Bank;