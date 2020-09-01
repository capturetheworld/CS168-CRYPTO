// Simple "broadcast" setup to enable easy testing

"use strict";

let miners = [];

exports.registerMiner = function() {
  for (let i=0; i<arguments.length; i++) {
    let m = arguments[i];
    miners.push(m);
  }
}

exports.broadcast = function(msg, o) {
  miners.forEach((m) => {
    m.emit(msg, o);
  });
}