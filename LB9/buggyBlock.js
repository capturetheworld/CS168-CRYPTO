"use strict";

const { Block } = require('spartan-gold');

module.exports = class BuggyBlock extends Block {
  /**
   * Accepts a new transaction if it is valid and adds it to the block. Unlike
   * the SpartanGold basic version, this one does **not** check the nonce.
   * 
   * @param {Transaction} tx - The transaction to add to the block.
   * @param {Client} [client] - A client object, for logging useful messages.
   * 
   * @returns {Boolean} - True if the transaction was added successfully.
   */
  addTransaction(tx, client) {
    if (this.transactions.get(tx.id)) {
      if (client) client.log(`Duplicate transaction ${tx.id}.`);
      return false;
    } else if (tx.sig === undefined) {
      if (client) client.log(`Unsigned transaction ${tx.id}.`);
      return false;
    } else if (!tx.validSignature()) {
      if (client) client.log(`Invalid signature for transaction ${tx.id}.`);
      return false;
    } else if (!tx.sufficientFunds(this)) {
      if (client) client.log(`Insufficient gold for transaction ${tx.id}.`);
      return false;
    }

    // Adding the transaction to the block
    this.transactions.set(tx.id, tx);

    // Taking gold from the sender
    let senderBalance = this.balanceOf(tx.from);
    this.balances.set(tx.from, senderBalance - tx.totalOutput());

    // Giving gold to the specified output addresses
    tx.outputs.forEach(({amount, address}) => {
      let oldBalance = this.balanceOf(address);
      this.balances.set(address, amount + oldBalance);
    });

    return true;
  }

}