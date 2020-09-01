"use strict";

let rand = require('./rand.js');

const NUM_ROUNDS = 100000;
const NUM_PLAYERS = 10;

// Initializing empty array
let results = [];
results[NUM_PLAYERS-1] = 0;
results.fill(0);

for (let i=0; i<NUM_ROUNDS; i++) {
  let r = rand.nextInt(NUM_PLAYERS);
  results[r]++;
}

for (let i=0; i<NUM_PLAYERS; i++) {
  console.log(`${i}: ${results[i]}`);
}
