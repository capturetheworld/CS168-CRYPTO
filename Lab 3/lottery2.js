"use strict";

let Player = require('./player.js').Player;
let net = require('./fakeNet.js');

class Lottery {
  constructor(players) {
    this.players = players;
    let i=0;
    this.players.forEach(p => {
        net.registerMiner(p);
        p.id = i++;
        p.numPlayers = this.players.length;
        p.game = this;
    });
  }

  play() {
    this.players.forEach(p => {
        p.commit();
    });
  }

  getPlayerName(i) {
    return this.players[i].name;
  }
}


let a = new Player('Alice');
let b = new Player('Bob');
let c = new Player('Charlie');

let game = new Lottery([a,b,c]);
game.play();
