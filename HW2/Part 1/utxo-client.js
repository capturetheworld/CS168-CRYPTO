"use strict";

let { Client } = require('spartan-gold');

let UtxoMixin = require('./utxo-mixin.js');

/**
 * A UtxoClient is capable of creating many different addresses.
 */
module.exports = class UtxoClient extends Client {

  /**
   * Extends client with UTXO support, including setting up a wallet.
   * 
   * @constructor
   * @param  {...any} args - Arguments needed for Client constructor.
   */
  constructor(...args) {
    super(...args);

    // Adding methods from utxo-mixin.js to clients.
    Object.assign(this, UtxoMixin);

    this.setupWallet();
  }

  /**
   * Gets balance of client from last confirmed block,
   * not counting any pending ingoing or outgoing transactions.
   * 
   * @returns {number} -- Total available gold as of the last confirmed block.
   */
  get confirmedBalance() {
    return this.getConfirmedBalance();
  }
  
}