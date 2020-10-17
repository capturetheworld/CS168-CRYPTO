"use strict";

const { Miner } = require("spartan-gold");

const UtxoMixin = require("./utxo-mixin.js");

/**
 * A UtxoMiner is capable of creating multiple addresses,
 * and will create a new address for any mining rewards.
 */
module.exports = class UtxoMiner extends Miner {

  /**
   * Extends miner with UTXO support, including setting up a wallet.
   * 
   * @constructor
   * @param  {...any} args - Arguments needed for Miner constructor.
   */
  constructor(...args) {
    super(...args);

    // Mixing in support for UTXOs.
    Object.assign(this, UtxoMixin);

    this.setupWallet();
  }

  /**
   * Gets balance of miner from last confirmed block,
   * not counting any pending ingoing or outgoing transactions.
   * 
   * @returns {number} -- Total available gold as of the last confirmed block.
   */
  get confirmedBalance() {
    return this.getConfirmedBalance();
  }

  /**
   * Sets up the miner to start searching for a new block.
   * 
   * @param {Set} [txSet] - Transactions the miner has that have not been accepted yet.
   */
  startNewSearch(...args) {

    // Check to see if the miner has already received a reward at this address
    // (or has a starting balance at this address). If so, set up a new one.
    //
    // To do this, you will need to compare the lastBlock's rewardAddr field against
    // the miner's current address, and to make sure that the address does not already
    // have a balance of gold associated with it.

    if(this.address === this.lastBlock.rewardAddr  || (typeof this.lastBlock.balances.get(this.address) !== 'undefined')){
      this.address = this.createAddress();
    }

 


    super.startNewSearch(...args);
  }

}