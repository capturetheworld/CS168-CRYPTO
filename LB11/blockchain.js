"use strict";

const utils = require('./utils.js');

const NUM_MESSAGE_PER_BLOCK = 5;
const NUM_LEADING_ZEROES = 10;

class BlockChain {

  constructor() {
    // A map of hashes to their blocks
    this.blocks = {};
    this.currentBlock = new Block(0);
  }

  // Adds a transaction to the current block.
  // If the block is filled, it will find a proof,
  // store it, and create a new block for future transactions.
  write(tx) {
    this.currentBlock.add(tx);
    if (this.currentBlock.size > NUM_MESSAGE_PER_BLOCK) {
      //
      // ***YOUR CODE HERE***
      //
      // Find a proof for the current block,

      this.currentBlock.findProof();
      // calculate its hash,
      let h = this.currentBlock.hash();
      // and add the block to the `this.blocks` map
      // using the hash as the key.
      this.blocks[h] = this.currentBlock;
      //
      // Next, make a new `this.currentBlock`, where the height is
      // one greater than the previous block and the `prevBlockHash`
      // refers to the old `this.currentBlock`.

      let old = this.currentBlock;

      this.currentBlock = new Block(old.blockHeight+1,h);

    }
  }

  // Returns true if the blockchain is valid.
  // That means that all the block's have valid proofs
  // and have the correct hash value.
  isValid() {
    //
    // ***YOUR CODE HERE***
    //
    // Verify that every block (except this.currentBlock)
    // has a valid proof.  Also verify that every block's
    for(let block in this.blocks){
      if(!this.blocks[block].verifyProof()){
        return false; //failed invalid proof
      }

      let correct_hash = block;

       // hash matches what the hash is **supposed** to be.
       if(this.blocks[block].blockHeight !== 0 && this.blocks[block].prevBlockHash !== correct_hash){
        return false; //wrong hash
       }


    }
   
  }

  // Returns the blockchain as a JSON string.
  toString() {
    let s = "";
    let block = this.currentBlock;
    do {
      s = block + ",\n" + s;
      block = this.blocks[block.prevBlockHash];
    } while (block);
    return `[${s}]`;
  }
}

// Helper class -- a single block in the blockchain.
class Block {

  // determines the leading zeroes in a hexadecimal string.
  static numZeroes(h) {
    let count = 0;
    for (let i=0; i<h.length; i++) {
      switch(h.charAt(i)) {
        case '8':
        case '9':
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'e':
        case 'f':
          return count;
        case '4':
        case '5':
        case '6':
        case '7':
          return count+1;
        case '2':
        case '3':
          return count+2;
        case '1':
          return count+3;
        case '0':
          count += 4;
          break;
        default:
          throw new Error("Unhandled case: " + h.charAt(i));
      }
    }
    // This last case comes up only if the hash string is all zeroes.
    return count;
  }

  constructor(blockHeight, prevBlockHash) {
    this.blockHeight = blockHeight;
    this.prevBlockHash = prevBlockHash;
    this.transactions = [];
    this.timestamp = new Date();
  }

  // Add a transaction.
  add(msg) {
    this.transactions.push(msg);
  }

  findProof() {
    //
    // ***YOUR CODE HERE***
    //
    // Search for a proof (storing it in `this.proof`).
    // Return once the verifyProof method returns true.
    let p=0;
    while (true){
      this.proof = p;
      if(this.verifyProof()){
        return;
      }
      p++;
    }

  }

  // Returns true if the block has a valid proof.
  verifyProof() {
    // This is similar to the previous lab,
    // except that the proof is part of the block already.
    let h = this.hash();
    let n = this.constructor.numZeroes(h);
    return n >= NUM_LEADING_ZEROES;
  }

  // Returns the hash of the block as a hex string.
  hash() {
    return utils.hash(this.toString());
  }

  // The number of transactions in the block.
  get size() {
    return this.transactions.length;
  }

  // Returns the block in JSON format.
  toString() {
   let s = `{ "timestamp": "${this.timestamp}", "prevBlockHash": "${this.prevBlockHash}", "proof": "${this.proof}",\n`;
   this.transactions.forEach(tx => {
     s += `  ${tx},\n`;
   });
   s += '}';
   return s;
  }
}

exports.BlockChain = BlockChain;
