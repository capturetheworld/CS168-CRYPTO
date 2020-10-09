"use strict";

const utils = require('./utils.js');

class Prover {
  constructor(numLeadingZeroes) {
    this.numLeadingZeroes = numLeadingZeroes;
  }



  verifyProof(s, proof) {
    //
    // ***YOUR CODE HERE***
    //
    let isVerified = false;
    let leadZeroCount = 0;
    let hexhash = utils.hash(s + proof);
    let hexArray = Array.from(hexhash);
    //console.log(typeof(hexhash.hexEncode()));
    //let bin = converttoBin(hexhash);
    //console.log(bin + "bin is")
    let counter = 0;
    // console.log(hexArray[] === '0');
    while(hexArray[counter] === '0'){
      console.log("YES");
      leadZeroCount += 4;
      counter++;
    }

    if(hexArray[counter] == '1'){
      leadZeroCount += 3;
    }else if(hexArray[counter]==='2' || hexArray[counter]==='3'){
      leadZeroCount += 2;
    }
    else if(hexArray[counter]==='4' || hexArray[counter]==='5' || hexArray[counter]==='6' || hexArray[counter]==='7'){
      leadZeroCount += 1;
    }
    console.log(leadZeroCount);
    console.log(this.numLeadingZeroes);
    return (leadZeroCount===this.numLeadingZeroes);
  }

  findProof(s) {
    //
    // ***YOUR CODE HERE***
    //
    let nonce = 0;

     while(0 === 0){
      if(this.verifyProof(s,nonce)){
        nonce = true;
        break;
      }
      else{
        nonce ++;
      }
    }
    return nonce;
  }
}
  

exports.Prover = Prover;


