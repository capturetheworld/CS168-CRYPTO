"use strict";

let EventEmitter = require('events');

let net = require('./fakeNet.js');
let rand = require('./rand');

const SHARE = "SHARE_NUMBER";

// Player for lottery game
class Player extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.shares = [];

    this.on(SHARE, this.handleShare);
  }

  share() {
    let number = rand.nextInt(this.numPlayers);
    net.broadcast(SHARE, {id: this.id, number: number});
  }

  handleShare(o) {
    this.shares[o.id] = o.number;
   // console.log(o);
    let keys = Object.keys(this.shares);
   // console.log("keys" + keys);

    if (keys.length === this.numPlayers) {
      this.determineWinner();
    }
  }

  determineWinner() {
    let sum = 0;
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

