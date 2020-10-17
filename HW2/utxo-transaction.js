"use strict";

const { Transaction, utils } = require("spartan-gold");

/**
 * A UtxoTransaction differs from a standard transaction in that it accepts
 * an array of input addresses.  Consequently, the 'from', 'pubKey', and 'sig'
 * fields are all arrays instead of single values.
 * 
 * Whenever a UTXO is spent, the entire balance of that account must be spent.
 * Any additional gold is sent to a newly generated 'change address'.
 */
module.exports = class UtxoTransaction extends Transaction {

  /**
   * In contrast to the constructor for the parent class, the from, pubKey,
   * and sig fields are expected to be arrays since there are multiple
   * inputs for a transaction.
   * 
   * The constructor for a transaction includes an array of outputs, meaning
   * that one transaction can pay multiple parties. An output is a pair of an
   * amount of gold and the hash of a public key (also called the address),
   * in the form:
   *    {amount, address}
   * 
   * @constructor
   * @param {Object} obj - The inputs and outputs of the transaction.
   * @param {Array} obj.from - The addresses of the payer.
   * @param obj.nonce - Number that orders the payer's transactions.
   * @param {Array} obj.pubKey - Public keys associated with the specified from address.
   * @param {Array} obj.sig - Signatures of the transaction.
   * @param {Array} [obj.outputs] - An array of the outputs.
   * @param [obj.fee] - The amount of gold offered as a transaction fee.
   * @param [obj.data] - Object with any additional properties desired for the transaction.
   */
  constructor({from, nonce, pubKey, sig=[], outputs, fee=0, data}) {
    super({from, nonce, pubKey, sig, outputs, fee, data});
  }

  /**
   * Verifies that there is currently sufficient gold for the transaction.
   * In contrast to the default version, this must sum up the total inputs.
   * 
   * @param {Block} block - Block used to check current balances
   * 
   * @returns {boolean} - True if there is enough gold for the transaction.
   */
  sufficientFunds(block) {
    return this.totalOutput() <= this.totalInput(block);
  }

  /**
   * Sums up the total of the UTXOs used as input for this transaction,
   * according to the specified block.
   * 
   * @param {Block} block - Block used to look up UTXO balances.
   */
  totalInput(block) {
    // Look up the balance for all address in the 'from' field of 'this'.
    
   let totalbalance = 0;

    for(let addressindex in this.from){
      totalbalance += block.balanceOf(this.from[addressindex]); //Gets the available gold for that all addresses of a client (gets address from "from" (addresses of payer))
    }

  return totalbalance;

  }

  /**
   * Signs the transaction and adds the signature to the list of signatures.
   * Note that the order of the keys used to sign the transaction must match
   * the order of public keys stored in the transaction.
   * 
   * @param privKey - Private key used to sign the transaction.
   */
  sign(privKey) {
    this.sig.push(utils.sign(privKey, this.id));
  }

  /**
   * Determines whether the signatures of the transaction are valid
   * and if the from addresses match the corresponding public keys.
   * 
   * @returns {Boolean} - Validity of the signature and from address.
   */
  validSignature() {
    // Going through the from, sig, and pubKey arrays, verify that:
    //
    for (let addressindex in this.from){
      if(!utils.addressMatchesKey(this.from[addressindex],this.pubKey[addressindex])){
        throw new Error('An address doesn\'t match the public key.');
      }
       if(!this.sig[addressindex]){
        throw new Error('There is no signature for this address index: ' + addressindex);
      }
      if(!utils.verifySignature(this.pubKey[addressindex], this.id, this.sig[addressindex]))
      {
        throw new Error('Invalid signature for the public key');
      } 
    }
    return true;
    // 1) The address matches the public key.
    // 2) There is a signature.
    // 3) The signature of this.id is valid for the public key.
    //
    // Return true if all of the above are true for every position in the arrays.

    //
    // **YOUR CODE HERE**
    //
  }

}