"use strict";

let crypto = require('crypto');


// WARNING!  There are much better hash functions to use
// for storing passwords.
const HASH_ALG = 'sha256';

function hash(s) {
  return crypto.createHash(HASH_ALG).update(s).digest('hex');
}


class PasswordManager {
  constructor() {
    this.passwords = {};
    this.salts = {};
  }
  storePassword(username, pwd) {
    let salt = Math.floor((Math.random()*1000)+1);
    //console.log(salt);
    // 1) Choose a unique salt value for the user
    // 2) Store the salt value in 'this.salts'
    this.salts[username] = salt;
    //console.log(this.salts);
    // 3) Concatenate the salt value with the password
    pwd = "" +salt+pwd;
    //console.log(typeof pwd);
    //console.log(pwd);
    // 4) Hash salt+password and store the result in this.passwords
   
    let hashed = hash(pwd);
    this.passwords[username] = hashed;
    //console.log(this.passwords);
  }
  verifyPassword(username, pwd) {
   if(hash(""+this.salts[username]+pwd) === this.passwords[username]){
    return true;
  }
  else{
    return false;
  }
    // Look up the user's salt and hash values,
    // and make sure they match the password entered.
  }
}

let pm = new PasswordManager();

function test(u, p) {
  if (pm.verifyPassword(u, p)) {
    console.log(`"${p}" is the correct password for ${u}.`);
  } else {
    console.log(`Sorry, "${p}" is not ${u}'s password.`);
  }
}

pm.storePassword('Alice', 'secret');
pm.storePassword('Bob', 'banana');
pm.storePassword('Charlie', 'E"_K!sHcA8S&-S2N');
pm.storePassword('Dave', 'secret');

test('Alice', 'secret');
test('Alice', 'notThePassword');
test('Dave', 'secret');
test('Dave', 'E"_K!sHcA8S&-S2N');
test('Charlie', 'E"_K!sHcA8S&-S2N');
