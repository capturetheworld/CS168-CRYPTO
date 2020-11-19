"use strict";

const { utils } = require("spartan-gold");
const StakeBlockchain = require("./stake-blockchain");

/**
 * According to Tendermint v. 0.6, a vote consists of:
 * 1) height
 * 2) round
 * 3) type (prevote, precommit, or commit)
 * 4) block hash
 * 5) signature
 * 
 * We add some additional fields for convenience.
 */
module.exports = class Vote {

  /**
   * Produce a vote for NIL (or no valid proposal received).
   */
  static makeNilVote(voter, type) {
     return Vote.makeVote(voter, type, StakeBlockchain.NIL);
  }

  /**
   * Produce a vote for for the specified block.
   */
  static makeVote(voter, type, blockID) {
    // Copying over several properties from the voter.
    let vote = new Vote(voter);

    // Adding additional details to vote.
    vote.from = voter.address;
    vote.blockID = blockID;
    vote.type = type;
    vote.pubKey = voter.keyPair.public;

    // Sign and return vote.
    vote.sign(voter.keyPair.private);
    return vote;
  }

  /**
   * Creates a new vote, specifying the voter (from field), the height and
   * the round that the vote is for, the type of vote (PREVOTE, PRECOMMIT,
   * or COMMIT), the ID of the block being voted for, and the public key
   * and signature of the voter.
   */
  constructor({ from, height, round, type, blockID, pubKey, sig }) {
    this.from = from;
    this.height = height;
    this.round = round;
    this.type = type;

    this.blockID = blockID;

    this.pubKey = pubKey;
    this.sig = sig;
  }

  get id() {
    let o = {
      from: this.from,
      height: this.height,
      round: this.round,
      type: this.type,
      blockID: this.blockID,
      pubKey: this.pubKey,
    };

    return utils.hash(JSON.stringify(o));
  }

  /**
   * Sign and store the signature with the specified private key.
   * 
   * @param privKey - private key to sign the proposal.
   */
  sign(privKey) {
    this.sig = utils.sign(privKey, this.id);
  }

  /**
   * Verifies that the signature is valid, and that the from address
   * and the public key in the proposal match.
   */
  hasValidSignature() {
    if (this.sig === undefined) {
      return false;
    } else if (!utils.addressMatchesKey(this.from, this.pubKey)) {
      return false;
    } else {
      return utils.verifySignature(this.pubKey, this.id, this.sig);
    }
  }

  /**
   * A vote is invalid if it is for a previous block height or if it does
   * not have a valid signature.
   * 
   * If a block is from a previous round, it is invalid UNLESS it was a
   * commit vote.  Commits are valid for all subsequent rounds.
   * 
   * @param {Validator} validator - Validator receiving the vote.
   */
  isValid(validator) {
    if (validator.height > this.height) {
      // Stale vote -- previous height.
      validator.log(`Ignoring stale ${this.type} vote ${this.id}: height ${this.height} vs. ${validator.height}`);
      return false;
    }

    // Note that commits are valid for all subsequent rounds.
    if (validator.round > this.round && this.type !== StakeBlockchain.COMMIT) {
      // Stale vote -- previous round.
      validator.log(`Ignoring stale ${this.type} vote ${this.id}: round ${this.round} vs. ${validator.round}`);
      return false;
    }

    if (!this.hasValidSignature()) {
      validator.log(`Invalid signature for vote ${this.id}.`);
      return false;
    }

    return true;
  }

  /**
   * Votes for a later height or a later round are considered "fresher",
   * and should take precedence.  There is also an ordering on the type
   * of votes.
   * 
   * @param {Vote} otherVote - the vote being compared to this vote.
   */
  fresherThan(otherVote) {
    if (this.height > otherVote.height) {
      return true;
    } else if (this.height < otherVote.height) {
      return false;
    }

    // Same height if we made it here
    if (this.round > otherVote.round) {
      return true;
    } else if (this.round < otherVote.round) {
      return false;
    }

    // COMMIT > PRECOMMIT > PREVOTE
    if (this.type === StakeBlockchain.COMMIT) {
      return otherVote.type !== StakeBlockchain.COMMIT;
    } else if (this.type === StakeBlockchain.PRECOMMIT) {
      return otherVote.type === StakeBlockchain.PREVOTE;
    } else {
      return false;
    }
  }

  /**
   * A vote is always stale if it is for a previous block.  If it is for a
   * previous round, it is stale unless it is a commit vote.
   * 
   * @param {number} height - The block in the blockchain that we are working on.
   * @param {number} round - The round we are on for trying to produce the current block.
   */
  isStale(height, round) {
    if (this.height < height) {
      return true;
    }
    if (this.round < round) {
      return this.type !== StakeBlockchain.COMMIT;
    }
    return false;
  }

};