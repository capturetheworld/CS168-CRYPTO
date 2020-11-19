"use strict";

const { Block } = require('spartan-gold');

const Validator = require('./validator.js');

module.exports = class StakeBlock extends Block {

  /**
   * A StakeBlock must keep track of amount of coins staked,
   * as well as the accumulated power for proposing the
   * selected block.
   */
  constructor(rewardAddr, prevBlock, target, coinbaseReward) {
    super(rewardAddr, prevBlock, target, coinbaseReward);

    // Tracking current balances of locked gold:  clientID -> totalAmount
    this.bondBalances = (prevBlock && prevBlock.bondBalances) ? new Map(prevBlock.bondBalances) : new Map();

    // Tracking power of validators (that is, priority for proposing blocks).
    this.accumPower = (prevBlock && prevBlock.accumPower) ? new Map(prevBlock.accumPower) : new Map();
  }

  /**
   * Returns the amount of gold bonded by the specified user address.
   * If no gold is bonded, 0 is returned.
   */
  amountGoldBonded(addr) {
    return this.bondBalances.get(addr) || 0;
  }

  /**
   * When rerunning a locking block, we must also replay the calculation
   * of accumulated power for determining the block proposer.
   * 
   * @param {Block} prevBlock - The previous block in the blockchain, used for initial balances.
   * 
   * @returns {Boolean} - True if the block's transactions are all valid.
   */
  rerun(prevBlock) {
    this.bondBalances = new Map(prevBlock.bondBalances);

    this.accumPower = new Map(prevBlock.accumPower);

    // Updating the accumulated power for the block.
    this.updateAccumPower(this.rewardAddr);

    return super.rerun(prevBlock);
  }

  /**
   * To validate block, we need to verify all signatures
   * and verify that the signers' account for more than
   * 2/3 of the total bonded coins.
   */
  hasValidProof() {
    // Being lazy and assuming the block is valid.
    return true;
  }

  /**
   * This defers calculating the accumulated power for each validator
   * to the Validator class.  (This organization is a little strange,
   * but minifies the files that need to be submitted for this assignment.)
   * 
   * @param proposerAddr - The address of the proposer who produced the block.
   */
  updateAccumPower(proposerAddr) {
    let upPower = Validator.prototype.updatePower;
    upPower(this.accumPower, this.bondBalances, proposerAddr);
  }

  /**
   * Returns total amount of bonded coins currently in the block.
   */
  getTotalStake() {
    let totalStake = 0;
    this.bondBalances.forEach((amountBonded) => {
      totalStake += amountBonded;
    });
    return totalStake;
  }
};