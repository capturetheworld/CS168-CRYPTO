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
    let keys = Object.keys(this.shares);
    if (keys.length === this.numPlayers) {
      this.determineWinner();
    }
  }

  determineWinner() {
    let sum = 0;
    this.shares.forEach((share) => {
      sum += share;
    });
    let winnerID = sum % this.numPlayers;
    let winnerName = this.game.getPlayerName(winnerID);
    console.log(`${this.name} announces ${winnerName} as the winner`);
  }
}


exports.Player = Player;

