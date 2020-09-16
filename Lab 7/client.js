"use strict";

const crypto = require('crypto');
const keypair = require('keypair');
const EventEmitter = require('events');

const SIG_ALG = 'RSA-SHA256';

const JOIN = "JOIN_NETWORK_REQUEST";
const SYNC = "SYNC_LEDGER";
const XFER = "XFER_FUNDS";

class Client extends EventEmitter {
  constructor(name, net) {
    super();
    this.name = name;
    this.net = net;

    this.keypair = keypair();
    this.net.registerMiner(this);

    // The following lines could be deleted without ill effect.
    // The important point is that a new client starts up without
    // knowing what the ledger is.
    this.ledger = undefined;
    this.clients = undefined;

    this.on(JOIN, this.addClient);
    this.on(XFER, this.updateLedger);
    this.on(SYNC, this.initialize);

    this.join();
  }

  join() {
    // Broadcast out name and public key
    let msg = { name: this.name, pubKey: this.keypair.public };
    this.net.broadcast(JOIN, msg);
  }

  initialize({ledger, clients, name, signature}) {
    // 1) Verify that this request is needed
    if (this.ledger !== undefined && this.clients !== undefined) return;

    // 2) Update ledger
    this.ledger = ledger;
    this.clients = clients;
  }

  addClient({name, pubKey}) {
    // If the ledger has not been initialized, ignore it
    if (this.ledger === undefined || this.clients === undefined) return;
    if (this.ledger[name] !== undefined) {
      //this.log(`${name} already exists in the network.`);
      return;
    }

    // New clients always begin with no funds.
    this.ledger[name] = 0;
    this.clients[name] = pubKey;

    // Send the client the latest ledger and client information
    this.net.send(name, SYNC, {ledger: this.ledger, clients: this.clients});
  }

  give(name, amount) {
    //
    // ***YOUR CODE HERE***
    //
    // 1) Make JSON object message to transfer money to another user
    
    let message = {"from": this.name, "to": name , 'amount': amount}
    // 2) Sign the message

    let signed_message = this.signObject(message);
    // 3) Broadcast signed message

    this.net.broadcast(XFER, {message: message, signature: signed_message} )


  }

  updateLedger({message, signature}) {
    // Ensure the client is ready to start processing requests.
    if (this.ledger === undefined) return;

    //
    // ***YOUR CODE HERE***
    //
    // 1) Verify signature
    // 2) Verify accounts exist
    // 3) Verify the sender has sufficient funds
    // 4) Update the ledger
    let signatureVerified = false;
    // console.log(signature + "TYPE IS HERE!!!");
    signatureVerified = this.verifySignature({"message":message,"name":message.from,"signature":signature});
    

    if(signature === undefined){
       console.log("no sig");
       return; //undefined sig
    }
    else if(!signatureVerified){
    l
       console.log("unverified sig");
      return; //unverified sig
    }
    else if(this.clients[message.from] === ""){
       console.log("no client");
      return; //no client

    }
    else if(this.ledger[message.from] < message.amount){
      console.log("not enough money in the \"from\" account");
      return;//not enough money
    }
    else{
      for(const ledg in this.ledger){
        console.log(ledg + " is the ledger");
        console.log(message.to +"  to this person");
        console.log(message.from + "  from this person")
        if(ledg === message.to){
          this.ledger[ledg] = this.ledger[ledg] + message.amount;
        }
        else if (ledg === message.from){
          this.ledger[ledg] = this.ledger[ledg] - message.amount;
        }
        else{
          // console.log("ain't right");
          return; //someone isn't correct
        }
      

      }

    }


  }

  // Placeholder method.
  punishCheater(name) {
    console.log(name+ "cheated!")
  }

  signObject(o) {
    let s = JSON.stringify(o);
    let signer = crypto.createSign(SIG_ALG);
    return signer.update(s).sign(this.keypair.private, 'hex');
  }

  verifySignature({message, name, signature}) {
    let s = JSON.stringify(message);
    let verifier = crypto.createVerify(SIG_ALG);
    let pubKey = this.clients[name];
    try {
      return verifier.update(s).verify(pubKey, signature, 'hex');
    } catch (e) {
      this.log(`Error validating signature: ${e.message}`);
      return false;
    }
  }

  showLedger() {
    let s = JSON.stringify(this.ledger);
    this.log(s);
  }

  log(m) {
    console.log(this.name + " >>> " + m);
  }
}

exports.Client = Client;
exports.JOIN = JOIN;
exports.SYNC = SYNC;
exports.XFER = XFER;
