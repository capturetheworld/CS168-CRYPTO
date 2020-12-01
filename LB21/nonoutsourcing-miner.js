"use strict";

const { Blockchain, Miner } = require('spartan-gold');

const MAX_STARTING_NONCE = 9999999999999;

module.exports = class NonoutsourcingMiner extends Miner {
  
  /**
   * When creating a new nonoutsourceable block, we need to add in the miner's
   * public key.  We should also choose a randomized nonce as the starting point,
   * or else all of the miners will find the same proof values, and the miner
   * with the most processing power will always win.
   */
  startNewSearch(...args) {
    super.startNewSearch(...args);

    // Need a random starting nonce to avoid having all miners search the same space.
    this.currentBlock.proof = this.getRandomStartingNonce();
    this.currentBlock.signPrelim(this.keyPair.private);

    this.currentBlock.pubKey = this.keyPair.public;
  }

  /**
   * A nonoutsourcing miner needs to go through the following steps to produce a block:
   * 
   * 1) Hash the prevBlockHash with the proof (nonce) value, and sign the hash.
   * 
   * 2) Hash the prevBlockHash, the public key, the proof, and the signed hash,
   *   and verify that the result is lower than the target.
   * 
   * 3) Hash the prevBlockHash, the transactions, and the rewardAddr,
   *   and sign the result.
   */
  findProof() {

    // Determine how many rounds to wait before checking for other messages.
    let pausePoint = this.currentBlock.proof + this.miningRounds;

    while (this.currentBlock.proof < pausePoint) {
      if(this.currentBlock.hasValidPrelimProof() === true){
         this.currentBlock.sign(this.keyPair.private); //sets sig2
         this.foundProof();
         break;
      }else{
          this.currentBlock.proof++;
          this.currentBlock.signPrelim(this.keyPair.private); //sets sig 1

      }
      // Check to see if the current block has a valid preliminary proof.
      // If so, sign the block (setting 'sig2'), call 'this.foundProof()',
      // and break out of the while loop.
      //
      // Otherwise, increment the proof and perform the first signature,
      // setting the value of 'sig1'.
      //
      // Note that the NonoutsourceableBlock class has some methods that
      // might be helpful.
    }

    // Check if anyone has found a block, and then return to mining.
    setTimeout(() => this.emit(Blockchain.START_MINING), 0);
  }

  foundProof() {
    this.log(`found nonoutsourceable proof for block ${this.currentBlock.chainLength}: ${this.currentBlock.proof}`);
    this.announceProof();
    this.receiveBlock(this.currentBlock);
    this.startNewSearch();
  }

  /**
   * Return a random integer.
   */
  getRandomStartingNonce() {
    return Math.floor(Math.random() * Math.floor(MAX_STARTING_NONCE));
  }

}