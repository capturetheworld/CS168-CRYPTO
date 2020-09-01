"use strict";

let Player = require('./player.js').Player;
let net = require('./fakeNet.js');

const SHARE = "SHARE_NUMBER";

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
        p.share();
    });
  }

  getPlayerName(i) {
    return this.players[i].name;
  }
}


let a = new Player('Alice');
let b = new Player('Bob');
let c = new Player('Charlie');

// Trudy is a cheater.
let t = new Player('Trudy');

// Trudy does NOT broadcast her number initially.
t.share = function(){};

// Trudy disables the old listener
t.removeListener(SHARE, t.handleShare);

// Trudy waits until everyone else has announced their choice.
// Then she chooses a number that will make her the winner.
t.handleShare = function(o) {
  let sum = 0;
  let num = 0;

  this.shares[o.id] = o.number;
  let keys = Object.keys(this.shares);
  if (keys.length === this.numPlayers-1) {


    this.shares.forEach((share) => {
      sum += share;
    });

    //console.log("ID is" + this.id);

    while((sum+num) % (this.numPlayers)  !== this.id){
      //console.log(num + "this is the num");
      //console.log (sum % this.id + num + "this is the calculation");
      num++;


    }

    // console.log("sum is " +sum);
    // console.log("num is " +num);

    // console.log("num, is " +num);
    // console.log("modulus is " +typeof(this.numPlayers));

    net.broadcast(SHARE, {id: this.id, number: num});
    t.determineWinner();
    

    //console.log(sum);
    //console.log(num);
    //console.log((sum+num) % this.id  === 0);
  }






};
t.on(SHARE, t.handleShare);

let game = new Lottery([a,b,c,t]);
game.play();
