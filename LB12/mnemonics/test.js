"use strict"; 
const assert = require('chai').assert;

const Mnemonic = require('./mnemonic.js').Mnemonic;

describe('Mnemonics', () => {
  describe('constructor', () => {
    const m = new Mnemonic();
    it('should load the specified file into an array of names', () => {
      // Testing some random words from the dictionary.
      assert.equal(m.wordlist[0], "abandon")
      assert.equal(m.wordlist[42], "aim");
      assert.equal(m.wordlist[861], "hill");
      assert.equal(m.wordlist[1066], "luxury");
      assert.equal(m.wordlist[1776], "task");
      assert.equal(m.wordlist[2047], "zoo");
    });
    it('should set the sequence', () => {
      assert.exists(m.seq);
    });
    it('should load a sequence from a list of words, is specified', () => {
      let m2 = new Mnemonic(m.words());
      assert.equal(m2.seq.toString('hex'), m.seq.toString('hex'));
    });
  });

  describe('.convertByteToBinString', () => {
    it("should convert an octet to a string of 0's and 1's", () => {
      let bs = Mnemonic.convertByteToBinString(0x74);
      assert.equal(bs, '01110100');
      bs = Mnemonic.convertByteToBinString(0xFE);
      assert.equal(bs, '11111110');
    });
  });

  describe('.convertBinStringToByte', () => {
    it("should convert a string of 0's and 1's to an octet", () => {
      let byte = Mnemonic.convertBinStringToByte('11111111');
      assert.equal(byte, 0xFF);
      byte = Mnemonic.convertBinStringToByte('00000000');
      assert.equal(byte, 0);
      byte = Mnemonic.convertBinStringToByte('10011010');
      assert.equal(byte, 0x9A);
    });
  });

  describe('.split', () => {
    it("should convert a buffer to an array of 11-bit unsigned ints", () => {
      let buffer = Buffer.from('cafebabe4200000000000000000000000000000000000000000000000000000001', 'hex');
      let elevenBits = Mnemonic.split(buffer);
      assert.deepEqual(elevenBits, [ 1623, 1966, 1404, 1056, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    });
  });

  describe('.translate11bit', () => {
    it("should convert an 11bit num to a string of zeroes and ones", ()=> {
      let bs = Mnemonic.translate11bit(2047);
      assert.equal(bs, '11111111111')
      bs = Mnemonic.translate11bit(0);
      assert.equal(bs, '00000000000')
      bs = Mnemonic.translate11bit(2);
      assert.equal(bs, '00000000010')
    });
  });

  describe('#words', () => {
    const m = new Mnemonic();
    it('should return a string of 24 words', () => {
      let s = m.words();
      let arr = s.split(' ');
      assert.equal(arr.length, 24);
    });
  });

  describe('#isValid', () => {
    it('should return true if the checksum matches its contents', () => {
      const m = new Mnemonic();
      assert.isTrue(m.isValid());
    });
    it('should return false if the checksum does not match its contents', () => {
      let m = new Mnemonic();
      // Corrupting the first byte of the sequence.
      let octet = m.seq.readUInt8(0);
      m.seq.writeUInt8(octet ^ 0x42, 0);
      assert.isFalse(m.isValid());
    });
  });

  describe('#generateSeed', () => {
    let m = new Mnemonic();
    let p = m.generateSeed();
    it('should return a seed with no passphrase supplied', () => {
      assert.isOk(p);
    });
    it('should return a 512 bit key', () => {
      assert.equal(p.length, 128); // 128 hex characters
    });
    it('should return a different seed with a passphrase', () => {
      let p2 = m.generateSeed('hello');
      assert.notEqual(p2, p);
    });
    it('should return different seeds for different passphrases', () => {
      let p2 = m.generateSeed("You had to hand it to the Patrician, he admitted grudgingly. If you didn't, he sent men to come and take it away.");
      let p3 = m.generateSeed("Not very honourable, I suppose, but then, there is no honour among consultants.");
      assert.notEqual(p2, p3);
    });
  });

});