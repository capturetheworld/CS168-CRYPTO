"use strict";

const { Blockchain, Miner, Client, utils } = require('spartan-gold');

const BigInteger = require('jsbn').BigInteger;

const NEW_POOL_BLOCK = "NEW_POOL_BLOCK";
const SHARE_FOUND = "SHARE_FOUND";

const MAX_STARTING_NONCE = 9999999999999;

// Shares require 3 less leading zeroes than proofs.
const SHARE_DIFF = 3;

/**
 * A pool miner does not do any of the coordination work that miners
 * typically do.  Instead, they focus on finding proofs for blocks
 * assigned to them by the pool operator.
 * 
 * Note that the pool miner does not change regardless of the pool
 * structure.  PPS, PROP, and PPLNS miners all operate in the same
 * way.
 */
module.exports = class PoolMiner extends Miner {

  /**
   * Pool miners must know the address of the pool operator, in
   * addition to the normal miner details.
   */
  constructor({name, net, startingBlock, keyPair, miningRounds, operatorAddress} = {}) {
    super({name, net, startingBlock, keyPair, miningRounds});
    this.operatorAddress = operatorAddress;

    this.receiveBlock = Client.prototype.receiveBlock;

    this.on(NEW_POOL_BLOCK, this.receivePoolBlock);
  }

  /**
   * We don't want to do the usual extra work when receiving a block
   * that normal miners do, so we use the client version instead.
   */
  receiveBlock(...args) {
    Client.prototype.receiveBlock.call(this, ...args);
  }

  /**
   * 
   * @param {Block} block - Block received from the pool operator.
   */
  receivePoolBlock(block) {
    this.currentBlock = Blockchain.deserializeBlock(block);
    this.log(`Receiving block ${this.currentBlock.id}`);
    this.startNewSearch();
  }

  /**
   * In contrast to the Miner, the Pool Miner does not produce the
   * initial block.  Instead the pool operator should give it to him.
   */
  startNewSearch() {
    // If there is no block yet, do nothing.
    if (this.currentBlock === undefined) return;

    // Start looking for a proof at a randomly chosen number.
    // We need to do this so that all pool miners are searching
    // different ranges of numbers.  (There are better approaches,
    // but this is easiest.)
    this.currentBlock.proof = this.getRandomStartingNonce();
  }

  /**
   * Pool miners search for a "share" rather than a "proof".
   * In essence, a share is a lesser proof-of-work than what
   * is required to make a block.
   */
  findProof() {
    // If no block yet, sleep for a second and check again.
    if (this.currentBlock === undefined) {
      setTimeout(() => this.findProof(), 1000);
      return;
    }

    // If we have a block, search for a share.
    let pausePoint = this.currentBlock.proof + this.miningRounds;
    while (this.currentBlock.proof < pausePoint) {
      if (this.hasValidShare(this.currentBlock)) {
        this.log(`found share for block ${this.currentBlock.chainLength}: ${this.currentBlock.proof}`);
        this.announceShare();
        // Note that we keep searching for more shares for the same block.
      }
      this.currentBlock.proof++;
    }
    setTimeout(() => this.emit(Blockchain.START_MINING), 0);
  }

  /**
   * A share is a lesser proof-of-work, but the logic is
   * the same.
   */
  hasValidShare(block) {
    let h = utils.hash(block.serialize());
    let n = new BigInteger(h, 16);
    // Adjusting the block's proof target to the share target.
    n = n.shiftRight(SHARE_DIFF);
    return n.compareTo(block.target) < 0;
  }

  /**
   * Instead of broadcasting the proof, the pool miner sends the "share"
   * to the pool operator.
   */
  announceShare() {
    // It would be easy for an attacker to swap out the address.
    // But we are ignoring that since we are focusing on other issues.
    let msg = {
      block: this.currentBlock,
      minerAddress: this.address
    };
    this.net.sendMessage(this.operatorAddress, SHARE_FOUND, msg);
  }

  /**
   * Return a random integer.
   */
  getRandomStartingNonce() {
    return Math.floor(Math.random() * Math.floor(MAX_STARTING_NONCE));
  }

  addTransaction() {
    // Pool miners do not collect transactions.
  }
  
}