// Simple "broadcast" setup to enable easy testing

"use strict";

let miners = [];
let minerNameMap = {};

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
    m.emit(msg, JSON.parse(s));
  });
}

exports.send = function(recipient, msg, o) {
  let s = JSON.stringify(o);
  let m = minerNameMap[recipient];
  if (m) {
    m.emit(msg, JSON.parse(s));
  }
}
