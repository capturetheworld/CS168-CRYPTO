// Simple "broadcast" setup to enable easy testing

"use strict";

let miners = [];
let minerNameMap = {};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

exports.registerMiner = function() {
  for (let i=0; i<arguments.length; i++) {
    let m = arguments[i];
    miners.push(m);
    // If the miner has a name, we add it to a map
    // for easy lookup.
    if (m.name) {
      minerNameMap[m.name] = m;
    }
  }
}

exports.broadcast = function(msg, o) {
  // Converting object to string and back
  // as a way to ensure that the sender and
  // receiver are not sharing objects.
  let s = JSON.stringify(o);

  miners.forEach((m) => {
    let delay = getRandomInt(1000);
    setTimeout(() => m.emit(msg, JSON.parse(s)), delay);
  });
}

exports.send = function(recipient, msg, o) {
  let s = JSON.stringify(o);
  let m = minerNameMap[recipient];
  let delay = getRandomInt(1000);
  if (m) {
    setTimeout(() => m.emit(msg, JSON.parse(s)), delay);
  }
}
