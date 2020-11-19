"use strict";

const { Miner, Blockchain } = require('spartan-gold');
const PoolMiner = require('./pool-miner');

const NEW_POOL_BLOCK = "NEW_POOL_BLOCK";
const SHARE_FOUND = "SHARE_FOUND";

const SHARE_REWARD = 2;

/**
 * Our base PoolOperator uses a pay-per-share (PPS) strategy.
 * This means that the operator immediately rewards a miner
 * whenever a share is found.
 * 
 * This strategy is risky for the operator, since a run of bad
 * luck could bankrupt them.  As a result, PPS mining pool
 * operators typically charge higher fees.
 * 
 * On the plus side, PPS mining pools are not vulnerable to
 * pool-hopping attacks.
 */

 this.storedAddresses = [];

module.exports = class PPLNS extends Miner {

  /**
   * A pool operator needs connections to its miners, in addition to
   * the normal miner stuff.
   */

   
  constructor({name, net, startingBlock, keyPair, miningRounds, poolNet} = {}) {
    super({name, net, startingBlock, keyPair, miningRounds, poolNet});

    this.poolNet = poolNet;

    // Copying hasValidShare method from PoolMiner class.
    this.hasValidShare = PoolMiner.prototype.hasValidShare;

    // Storing transactions for next block.
    this.transactions = new Set();

    this.on(SHARE_FOUND, this.receiveShare);

    
  }

  rewardMiner(minerAddress) {
    // this.storedAddresses.push(minerAddress);
    // this.log(`Paying ${minerAddress} ${SHARE_REWARD} gold for their share.`);
    // this.postTransaction([{address: minerAddress, amount: SHARE_REWARD}], 0);

    this.storedAddresses.push(minerAddress);

    // this.storedAddresses=[];
    
    console.log(`${minerAddress} found a share`);
  }

  payRewards() {
//     this.postTransaction([{address: this.address, amount: 5}], 0);

//     let leftover = this.currentBlock.coinbaseReward-5;

//     for(let contribution in this.contributer){
//         this.postTransaction([{address: this.contributer[contribution], amount: reward}], 0);
//         leftover = leftover - reward;
//     }
//     this.postTransaction([{address: this.address, amount: remain}], 0);

let leftover = this.currentBlock.coinbaseReward;
for(let contribution in this.storedAddresses){
    if(contribution > 4){
        break;
    }

    remain = remain - 4;

    this.postTransaction([{address: this.storedAddresses[k], amount: 4}], 0);

    if(contribution > 4){
        this.log(`Paying ${this.storedAddresses[]} 4 gold for their share.`);
}


  }
  
}