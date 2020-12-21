"use strict";

const { Miner, Blockchain } = require('spartan-gold');

module.exports = class SelfishMiner extends Miner {

  constructor(...args) {
    super(...args);
    this.greedyMode = true;
  }

  /**
   * A selfish miner announces a proof only when the rest
   * of the mining network has caught up.
   */
  announceProof() {
    //
    // ***YOUR CODE HERE***
    //

    if(this.greedyMode !== true){
      super.announceProof()
    }
    else{
      continue;
    }
    //this.net.broadcast(Blockchain.PROOF_FOUND, this.currentBlock);
  }

  /**
   * When selfish miners receive a block, they check to see if the rest of
   * the network is catching up.  If so, the selfish miners share their
   * secret blocks.
   * 
   * In our version, the selfish miner will no longer be selfish once the rest
   * of the network has caught up.
   */
  receiveBlock(block) {
    block = Blockchain.deserializeBlock(block);
    super.receiveBlock(block);

    if (block.rewardAddr === this.address || this.greedyMode !== true) return block;
    if((block.chainLength - this.lastBlock.chainLength) <= 5){
      this.net.broadcast(Blockchain.PROOF_FOUND, this.currentBlock);
    }
    this.greedyMode = false;
    //
    // ***YOUR CODE HERE***
    //
    // If the other miners are close to catching up, announce the most recent block.
  }
}