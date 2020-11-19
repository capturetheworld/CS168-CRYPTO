"use strict";

const GleamVirtualMachine = require('./gleam.js').GleamVirtualMachine;

let vm = new GleamVirtualMachine(0, {});

if (process.argv0 === 'node') {
  process.argv.shift();
}

let bytecodeFile = process.argv[1];
let gasLimit = parseInt(process.argv[2]) || 0;

console.log(`Calling ${bytecodeFile} produced ${vm.evaluate(bytecodeFile, gasLimit)}.`);
