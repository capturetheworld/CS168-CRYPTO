"use strict";

let EventEmitter = require('events');

let net = require('./fakeNet.js');
let rand = require('./rand');
let crypto = require('crypto');
const HASH_ALG = 'sha256';




const SHARE = "SHARE_NUMBER";
const COMMIT = "COMMIT_HASH";

// Player for lottery game
class Player extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.shares = [];
    this.nonces = [];
    this.hashes = [];

    this.on(SHARE, this.handleShare);
    this.on(COMMIT, this.handleCommit);
  }

  hash(s) {
  return crypto.createHash(HASH_ALG).update(s).digest('hex');
  }

  share() {
    //let number = rand.nextInt(this.numPlayers);
    net.broadcast(SHARE, {id: this.id, number: this.number, nonce: this.nonce});
  }

  handleShare(o) {
    //  console.log("we are here");
    this.shares[o.id] = o.number;
    this.nonces[o.id] = o.nonce;
   // console.log(o);
    let keys = Object.keys(this.shares);
   // console.log("keys" + keys);

    if (keys.length === this.numPlayers) {
      this.determineWinner();
    }
  }

  commit(){
    //console.log("we are here 1");
    this.number = rand.nextInt(this.numPlayers);
    this.nonce = rand.nextInt(249);
    this.hashed = this.hash("" + this.nonce + this.number);
    net.broadcast(COMMIT, {id: this.id, hashednum: this.hashed})

  }

  handleCommit(o){
    //console.log("we are here 2");
    this.hashes[o.id] = o.hashednum;
    let hkeys = Object.keys(this.hashes);
    if(hkeys.length === this.numPlayers){
      //console.log("we are here 3");
      this.share();
    }


  }

  determineWinner() {
    let sum = 0;

    for(let i = 0; i<this.hashes.length; i++){
      let testhash = this.hash("" + this.nonces[i] + this.shares[i]);
      if(testhash !== this.hashes[i]){
        console.log("ERROR FOUND!");
      }

    }



    this.shares.forEach((share) => {
     // console.log(this.name);
     // console.log("share is" + share);
      sum += share;
     // console.log("sum is now" +  sum + "\n");
    });

    

    let winnerID = sum % this.numPlayers;
    //console.log(this.name + " " + winnerID);
    let winnerName = this.game.getPlayerName(winnerID);
    console.log(`${this.name} announces ${winnerName} as the winner`);
  }
}



exports.Player = Player;

