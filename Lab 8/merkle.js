"use strict";

const utils = require('./utils.js');
let addto = [];

// Stores transactions in a MerkleTree format.
// The tree will be perfectly balanced.
class MerkleTree {

  // Returns the size
  static calculateSize(numElems) {
    // Calculate a power of 2 at least as large as numElems.
    let n = 1;
    while (n < numElems) {
      n *= 2;
    }
    // We need almost double the space to hold the parent hashes.
    // E.g. if we have 8 transactions, we need to store their 8
    // hashes plus the 7 parent hashes.
    return (n * 2) - 1;
  }

  // Hashes from a node to the Merkle root, or until it does not have
  // the other half of the hash needed to continue to the root.
  static hashToRoot(hashes, i) {
    if (i === 0) return;
    let par = (i-2)/2;
    hashes[par] = utils.hash("" + hashes[i-1] + "," + hashes[i]);

    // Test to see if we are the right subnode.  If so, we can hash
    // with the left subnode to continue one level up.
    if (par%2 === 0) {
      this.hashToRoot(hashes, par);
    }
  }

  constructor(transactions) {
    // Actual transactions
    this.transactions = [];

    // Transaction hashes
    this.hashes = [];

    // hash-to-index Lookup table
    this.lookup = {};

    // We want to maintain a balanced tree, so we may need to pad
    // out the last few elements.
    let numBalancedTree = this.constructor.calculateSize(transactions.length);

    // Hashes of transactions start in the middle of the array.
    let firstTrans = Math.floor(numBalancedTree / 2);

    for (let i=firstTrans; i<numBalancedTree; i++) {
      let tNum = i - firstTrans;

      // If we have less than a power of 2 elements,
      // we pad out the transactions and arrays with the last element
      let v = tNum<transactions.length ? transactions[tNum].toString() : this.transactions[tNum-1];
      let h = utils.hash(v);

      this.transactions[tNum] = v;
      this.hashes[i] = h;
      this.lookup[h] = i;
    }

    // Completing inner nodes of Merkle tree
    for (let i=firstTrans+1; i<this.hashes.length; i+=2) {
      this.constructor.hashToRoot(this.hashes, i);
    }
  }

  // Returns the Merkle root
  get root() {
    return this.hashes[0];
  }

   recurring(index,path){
    if(index === 0){
      return path;
    }

    if(index%2 ===1){ //odd
      path.push(this.hashes[i+1]); //grab even sibling
      let singleParent = (i-1)/2;


    }
    else if(index%2 ===0 ){ //even
      path.push(this.hashes[i+1]); //grab odd sibling
      let singleParent = (i-2)/2;

    }

    //check the parent
    if(singleParent % 2 ===1){ //if parent is odd recur on even
       this.recur(singeParent+1,path);
    }
    else{ //else recur on odd
       this.recur(singeParent-1,path);
    }

  }

  getPath(transaction) {
    let h = utils.hash(transaction); //
    let i = this.lookup[h]; //index of the looked up hash
    let path = { txInd: i };

    //
    // **YOUR CODE HERE**
    //
    // Starting at i, build up a path to the root, containing ONLY the nodes
    // needed to reconstruct the Merkle root.  Include their position in the
    // array so that a user who knows only the path and the Merkle root can
    // verify the path.
     path.i = this.hashes[i];//add hash

    if(i==0){ 
      return path;
    }

    this.recur(i,path);
  
    return path;
  }



  // Return true if the tx matches the path.
  verify(tx, path) {
    let i = path.txInd;
    let h = utils.hash(tx);

    //
    // **YOUR CODE HERE**
    //
    // starting at i, hash the appropriate nodes and verify that their hashes
    // match their parent nodes, until finally hitting the Merkle root.
    // If the Merkle root matches the path, return true.

     for (pathway in path.pool) {

      if(path.pool[pathway]% 2=== 0){
        hashed = utils.hash(h + "" + this.hashes[path.pool[pathway]]); 
      }
    
      else{
        hashed = utils.hash(this.hashes[path.pool[pathway]] + "" + h); 
      }
    }
    

    if(hashed !== this.hashes[0]){
      return false;
    }
    else{
      return true;
    }
  }
  

  // Returns a boolean indicating whether this node is part
  // of the Merkle tree.
  contains(t) {
    let h = utils.hash(t);
    return this.lookup[h] !== undefined;
  }

  // Method to print out the tree, one line per level of the tree.
  // Note that hashes are truncated to 6 characters for the sake
  // of brevity.
  display() {
    let i = 0;
    let nextRow = 0;
    let s = "";

    console.log();

    while (i < this.hashes.length) {
      // Truncating hashes for the sake of readability
      s += this.hashes[i].slice(0,6) + " ";
      if (i === nextRow) {
        console.log(s);
        s = "";
        nextRow = (nextRow+1) * 2;
      }
      i++;
    }
  }
}


exports.MerkleTree = MerkleTree;
