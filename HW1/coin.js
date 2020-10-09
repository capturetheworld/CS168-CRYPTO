"use strict";

const BigInteger = require('jsbn').BigInteger;
const blindSignatures = require('blind-signatures');

const utils = require('./utils.js');

const NUM_COINS_REQUIRED = 10;
const COIN_RIS_LENGTH = 20;
const BANK_STR = "ELECTRONIC_PIGGYBANK";
const IDENT_STR = "IDENT";


// A class representing a single DigiCash-lite coin.
// Note that this coin should not be shared with the bank
// if anonymity is desired.
class Coin {

  // Utility function to parse the coin's string format
  // and return the left and right identity hashes.
  // (A merchant can use these hashes to determine if the client
  // sent a valid identity string).
  static parseCoin(s) {
    let [cnst,amt,guid,leftHashes,rightHashes] = s.split('-');
    if (cnst !== BANK_STR) {
      throw new Error(`Invalid identity string: ${cnst} received, but ${BANK_STR} expected`);
    }
    let lh = leftHashes.split(',');
    let rh = rightHashes.split(',');
    return [lh,rh];
  }

  // To mint a new coin, you need to specify the purchases,
  // the value of the coin, and the public key parameters of
  // the bank (given by n and e).
  constructor(purchaser, amount, n, e) {
    this.amount = amount;
    this.n = n;
    this.e = e;

    this.guid = utils.makeGUID();
    this.leftIdent = [];
    this.rightIdent = [];

    let leftHashes = [];
    let rightHashes = [];

    for (let i=0; i<COIN_RIS_LENGTH; i++) {
      // Making an OTP for the identity string.
      let { key, ciphertext } = utils.makeOTP({string: `${IDENT_STR}:${purchaser}`});

      this.leftIdent.push(key);
      leftHashes.push(utils.hash(key));

      this.rightIdent.push(ciphertext);
      rightHashes.push(utils.hash(ciphertext));
    }

    this.coinString = `${BANK_STR}-${this.amount}-${this.guid}-${leftHashes.join(',')}-${rightHashes.join(',')}`;
  }

  // Calculates the blinded hash of the coin and returns
  // the blinding factor needed to unblind the coin.
  blind() {
    let { blinded, r } = blindSignatures.blind({
        message: this.toString(),
        N: this.n,
        E: this.e,
    });
    this.blinded = blinded;
    return r;
  }

  // Takes in the blinding factor previously used to blind the coin
  // and calculates the unblinded signature from the blinded signature.
  unblind(r) {
    if (this.signature === undefined) {
      throw new Error(`The unblind method is only for unsigned documents.`);
    }
    this.signature = blindSignatures.unblind({
        signed: this.signature,
        N: this.n,
        r: r,
    });
  }

  // Returns true if the blinding factor and the blinded hash
  // match the coin's string representation.
  verifyUnblinded(r) {
    let n = new BigInteger(this.n);
    let e = new BigInteger(this.e);
    let blindHash = this.blinded.toString();

    let h = blindSignatures.messageToHash(this.toString());
    let bigHash = new BigInteger(h, 16);

    let b = bigHash.multiply(r.modPow(e, n)).mod(n).toString();
    return blindHash === b;
  }

  // Returns the coin's public string representation.
  // The bank should not see this value initially, but otherwise
  // it can be safely shared without breaking anonymity.
  toString() {
    return this.coinString;
  }

  // For an RIS at position i, returns either the left or right
  // half of the identity pair.
  getRis(isLeft, i) {
    if (isLeft) {
      return this.leftIdent[i];
    } else {
      return this.rightIdent[i];
    }
  }
}

exports.Coin = Coin;
exports.COIN_RIS_LENGTH = COIN_RIS_LENGTH;
exports.IDENT_STR = IDENT_STR;
exports.BANK_STR = BANK_STR;
exports.NUM_COINS_REQUIRED = NUM_COINS_REQUIRED;

