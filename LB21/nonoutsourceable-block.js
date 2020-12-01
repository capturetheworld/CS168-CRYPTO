"use strict";

const BigInteger = require('jsbn').BigInteger;

const { Block, utils } = require('spartan-gold');

module.exports = class NonOutsourceableBlock extends Block {

  /**
   * The hash of the previous block and the proof, used as the
   * input for calculating 'sig1'.
   */
  prelimHash() {
    return utils.hash(`${this.prevBlockHash}||${this.proof}`);
  }

  /**
   * Hash the previous block hash and the proof, and sign
   * the result with the miner's private key.
   */
  signPrelim(privKey) {
    this.sig1 = utils.sign(privKey, this.prelimHash());
  }

  /**
   * This hash should include the previous block hash, the public key, the proof,
   * and the first signature.
   */
  miningHash() {
    this.miningHash =utils.hash(`${this.prevBlockHash}||${this.pubKey}||${this.proof}||${this.sig1}`);
  }

  /**
   * Return 'true' if the miningHash is less than the target
   * and the first signature is valid.
   */
  hasValidPrelimProof() {
    let n = new BigInteger(this.miningHash(), 16);
    if (n.compareTo(this.target) > 0) {
      return false;
    } else {
      return utils.verifySignature(this.pubKey, this.prelimHash(), this.sig1);
    }
  }

  /**
   * Return the hash of the transactions and the reward address,
   * used for the second signature.
   */
  transactionHash() {
    let o = {
      chainLength: this.chainLength,
      timestamp: this.timestamp,
      transactions: Array.from(this.transactions.entries()),
      rewardAddr: this.rewardAddr,
      prevBlockHash: this.prevBlockHash,
    };
    return utils.hash(JSON.stringify(o));
  }

  /**
   * Sign the transaction hash and save the result in 'sig2' of the block.
   */
  sign(privKey) {
    this.sig2 = utils.sign(privKey, this.transactionHash());
  }

  /**
   * A valid block must have a valid preliminary proof and it must have an
   * additional signature (sig2) for the transactions and the reward address.
   */
  hasValidProof() {
    return(this.hasValidPrelimProof() && this.sig2 !== undefined)
  }

  /**
   * When serializing a nonoutsourceable block, we need to include the
   * signatures and the public key.
   */
  toJSON() {
    let o = super.toJSON();
    o.sig1 = this.sig1;
    o.sig2 = this.sig2;
    o.pubKey = this.pubKey;
    return o;
  }

}