"use strict";

let crypto = require('crypto');

const MAX_RANGE = 256;

// Returns a random number between 0 and 255.
function sample() {
  return crypto.randomBytes(1).readUInt8();
}

exports.nextInt = function(range) {
  if (range > MAX_RANGE) {
    throw new Error(`Sorry, range cannot be more than ${MAX_RANGE}`);
  }

  let useable_range = Math.floor(MAX_RANGE/range)*range;

  let testNum = sample();

  while(testNum > useable_range){
	testNum = sample();
	
	}

  return testNum % range;



}

