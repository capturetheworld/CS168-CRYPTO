"use strict";

const blindSignatures = require('blind-signatures');

const { Coin, COIN_RIS_LENGTH, IDENT_STR, BANK_STR } = require('./coin.js');
const utils = require('./utils.js');

// Details about the bank's key.
const BANK_KEY = blindSignatures.keyGeneration({ b: 2048 });
const N = BANK_KEY.keyPair.n.toString();
const E = BANK_KEY.keyPair.e.toString();

/**
 * Function signing the coin on behalf of the bank.
 * 
 * @param blindedCoinHash - the blinded hash of the coin.
 * 
 * @returns the signature of the bank for this coin.
 */
function signCoin(blindedCoinHash) {
  return blindSignatures.sign({
      blinded: blindedCoinHash,
      key: BANK_KEY,
  });
}

/**
 * Parses a string representing a coin, and returns the left/right identity string hashes.
 *
 * @param {string} s - string representation of a coin.
 * 
 * @returns {[[string]]} - two arrays of strings of hashes, commiting the owner's identity.
 */
function parseCoin(s) {
  let [cnst,amt,guid,leftHashes,rightHashes] = s.split('-');
  if (cnst !== BANK_STR) {
    throw new Error(`Invalid identity string: ${cnst} received, but ${BANK_STR} expected`);
  }
  //console.log(`Parsing ${guid}, valued at ${amt} coins.`);
  let lh = leftHashes.split(',');
  let rh = rightHashes.split(',');
  return [lh,rh];
}

/**
 * Procedure for a merchant accepting a token. The merchant randomly selects
 * the left or right halves of the identity string.
 * 
 * @param {Coin} - the coin that a purchaser wants to use.
 * 
 * @returns {[String]} - an array of strings, each holding half of the user's identity.
 */
function acceptCoin(coin) {
 
      
    // 1) Verify that the signature is valid.
    let cs = coin.toString();
    let valid = blindSignatures.verify({
      unblinded: coin.signature,
      N: N,
      E: E,
      message: cs,
    });

    if(!valid){
      throw new Error("Invalid signature");
    }


     // 2) Gather the elements of the RIS, verifying the hashes.

     let [lh,rh] = parseCoin(cs); //hashes commit spender of coin to a certain value
     let ris =[]; //each has different id string

     for(let i = 0; i<lh.length; i++){
      let isLeft = !!utils.randInt(2);
      let identHalf = coin.getRis(isLeft,i);
      let hashVal = isLeft ? lh[i] : rh[i];

      if(h !== hashVal){
        throw new Error(`Expected ${hashVal} but got ${h}`);
      }

      ris.push(identHalf);
     }




     // 3) Return the RIS.

     return ris;





}




/**
 * If a token has been double-spent, determine who is the cheater
 * and print the result to the screen.
 * 
 * If the coin purchaser double-spent their coin, their anonymity
 * will be broken, and their idenityt will be revealed.
 * 
 * @param guid - Globablly unique identifier for coin.
 * @param ris1 - Identity string reported by first merchant.
 * @param ris2 - Identity string reported by second merchant.
 */
function determineCheater(guid, ris1, ris2) {
  //
  // ***YOUR CODE HERE***
  //
  // Go through the RIS strings one pair at a time.
  // If the pair XORed begins with IDENT, extract coin creator ID.
  // Otherwise, declare the merchant as the cheater.

 
  
}

let coin = new Coin('alice', 20, N, E);

coin.signature = signCoin(coin.blinded);

coin.unblind();


// Merchant 1 accepts the coin.
let ris1 = acceptCoin(coin);


// Merchant 2 accepts the same coin.
let ris2 = acceptCoin(coin);


// The bank realizes that there is an issue and
// identifies Alice as the cheater.
determineCheater(coin.guid, ris1, ris2);

console.log();
// On the other hand, if the RIS strings are the same,
// the merchant is marked as the cheater.
determineCheater(coin.guid, ris1, ris1);

