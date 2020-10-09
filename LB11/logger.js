"use strict";

// Using Log4j logging levels
const ALL = 0;
const DEBUG = 1;
const INFO = 2;
const WARN = 3;
const ERROR = 4;
const FATAL = 5;
const OFF = 6;

const BlockChain = require('./blockchain.js').BlockChain;

// A tamper-resistant logging framework.
class Logger {

  // Converts constants to meaningful strings.
  static decode(level) {
    switch(level) {
      case 0: return "ALL";
      case 1: return "DEBUG";
      case 2: return "INFO";
      case 3: return "WARN";
      case 4: return "ERROR";
      case 5: return "FATAL";
      case 6: return "OFF";
      default:
        throw new Error(`Unknown logging level: ${level}`);
    }
  }

  // Sets an initial logging level.  Only messages
  // at this level or higher will be included.
  constructor(loggingLevel) {
    this.loggingLevel = loggingLevel || INFO;
    this.bc = new BlockChain();
  }

  // Generic logging method -- in general, this won't be
  // used directly.
  log(msg, level) {
    //console.log(`${this.constructor.decode(level)}: ${msg}`);
    let o = {
      message: msg,
      time: new Date(),
      logLevel: this.constructor.decode(level),
    };
    this.bc.write(JSON.stringify(o));
  }

  debug(msg) {
    this.log(msg, DEBUG);
  }

  info(msg) {
    this.log(msg, INFO);
  }

  warn(msg) {
    this.log(msg, WARN);
  }

  error(msg) {
    this.log(msg, ERROR);
  }

  fatal(msg) {
    this.log(msg, FATAL);
  }

  // Prints out the logs in JSON format,
  // including the blockchain information.
  displayBlockchain() {
    console.log(this.bc.toString());
  }

  // Returns true if the blockchain is valid.
  verifyBlockchain() {
    return this.bc.isValid();
  }
}

exports.Logger  = Logger;
exports.ALL     = ALL;
exports.DEBUG   = DEBUG;
exports.INFO    = INFO;
exports.WARN    = WARN;
exports.ERROR   = ERROR;
exports.FATAL   = FATAL;
exports.OFF     = OFF;