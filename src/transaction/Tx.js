/* eslint-disable max-classes-per-file */
const { uniqBy } = require("lodash");
const { Buffer } = require("buffer");
const BN = require("bn.js");
const BufferReader = require("../utils/BufferReader");
const BufferWriter = require("../utils/BufferWriter");
const TxOut = require("./TxOut");
const { N0, N1 } = require("../utils/num");
const { sha256 } = require("../utils/hash");

const { fetchTx } = require("./txFetcher");
const Script = require("../script/Script");
// eslint-disable-next-line no-unused-vars
const PrivateKey = require("../crypto/PrivateKey");

const SIGHASH_ALL = Buffer.from([1, 0, 0, 0]);
const SIGHASH_ALL_ONE = Buffer.from([1]);

class TxIn {
  constructor(
    prevTx,
    prevIndex,
    scriptSig,
    sequence = Buffer.from([0xff, 0xff, 0xff, 0xff])
  ) {
    /** @type {Buffer} */
    this.prevTx = prevTx;
    /** @type {BN} */
    this.prevIndex = prevIndex;
    /** @type {Script} */
    this.scriptSig = scriptSig || new Script();
    this.sequence = sequence;

    // *******************************
    // Coming from the corresponding previous tx output:
    /** @type {BN} */
    this.amount = undefined;
    /** @type {Script} */
    this.scriptPubKey = undefined;
  }

  /**
   * @param {BufferReader} br buffer reader
   */
  static parse(br) {
    const prevTx = br.read(32);
    const prevIndex = br.readBN(4);
    const scriptSig = Script.parse(br);
    const sequence = br.read(4);

    return new TxIn(prevTx, prevIndex, scriptSig, sequence);
  }

  serialize() {
    return Buffer.concat([
      Buffer.from(this.prevTx).reverse(),
      this.prevIndex.toArrayLike(Buffer, "le", 4),
      this.scriptSig.serialize(),
      Buffer.from(this.sequence).reverse()
    ]);
  }

  // TODO very similar to #serialize maybe refactor
  async serializeForSigning(isIdxToSign, testnet = false) {
    if (isIdxToSign) {
      await this.populateFromPrevOut(testnet);
      return Buffer.concat([
        Buffer.from(this.prevTx).reverse(),
        this.prevIndex.toArrayLike(Buffer, "le", 4),
        this.scriptPubKey.serialize(),
        Buffer.from(this.sequence).reverse()
      ]);
    }
    return Buffer.concat([
      Buffer.from(this.prevTx).reverse(),
      this.prevIndex.toArrayLike(Buffer, "le", 4),
      Buffer.from([0]), // substitute scriptPubKey for 0x00
      Buffer.from(this.sequence).reverse()
    ]);
  }

  async populateFromPrevOut(testnet = false) {
    // eslint-disable-next-line no-use-before-define
    const tx = await fetchTx(this.prevTx.toString("hex"), Tx.parse, testnet);
    this.amount = tx.txOuts[this.prevIndex].amount;
    this.scriptPubKey = tx.txOuts[this.prevIndex].scriptPubKey;
  }

  async value(parseTxFn, testnet = false) {
    const tx = await fetchTx(this.prevTx.toString("hex"), parseTxFn, testnet);
    this.amount = tx.txOuts[this.prevIndex].amount;
  }

  // TODO I don't think this is being used
  async scriptPubKey(parseTxFn, testnet = false) {
    const tx = await fetchTx(this.prevTx.toString("hex"), parseTxFn, testnet);
    this.scriptPubKey = tx.txOuts[this.prevIndex].scriptPubKey;
  }
}

class Tx {
  /**
   * @param {BN} version
   * @param {TxIn[]} txIns
   * @param {TxOut[]} txOuts
   * @param {Buffer} locktime
   * @param {boolean} [testnet=false]
   */
  constructor(version, txIns, txOuts, locktime, testnet = false) {
    this.version = version;
    /** @type {TxIn[]} */
    this.txIns = txIns;
    /** @type {TxOut[]} */
    this.txOuts = txOuts;
    /** 4 bytes @type {Buffer} */
    this.locktime = locktime;
    /** @type {boolean} */
    this.testnet = testnet;
  }

  /**
   * Could be a stream
   * @param {Buffer} serialization
   */
  static parse(serialization) {
    const br = BufferReader.from(serialization);
    const version = br.readBN(4);
    const numOfInputs = br.readVarIntBN();
    const txIns = [];
    for (let i = N0; i.lt(numOfInputs); i = i.add(N1)) {
      txIns.push(TxIn.parse(br));
    }
    const numOfOutputs = br.readVarIntBN();
    const txOuts = [];
    for (let i = N0; i.lt(numOfOutputs); i = i.add(N1)) {
      txOuts.push(TxOut.parse(br));
    }
    const locktime = br.read(4);

    return new Tx(version, txIns, txOuts, locktime);
  }

  id() {
    return Buffer.from(sha256(this.serialize()), "hex")
      .reverse()
      .toString("hex");
  }

  serialize() {
    return Buffer.concat([
      this.version.toArrayLike(Buffer, "le", 4),
      BufferWriter.toVarIntNum(this.txIns.length),
      Buffer.concat(this.txIns.map(i => i.serialize())),
      BufferWriter.toVarIntNum(this.txOuts.length),
      Buffer.concat(this.txOuts.map(o => o.serialize())),
      this.locktime
    ]);
  }

  fee() {
    // ins_amount - outs_amount
    return Promise.all(
      // populate the txIns[n].amount
      uniqBy(this.txIns, i => i.prevTx).map(i =>
        i.value(Tx.parse, this.testnet)
      )
    )
      .then(() =>
        this.txIns.reduce((sum, currentIn) => sum.add(currentIn.amount), N0)
      )
      .then(insValue =>
        insValue.sub(
          this.txOuts.reduce((sum, currentTx) => sum.add(currentTx.amount), N0)
        )
      );
  }

  /**
   * Returns the integer representation of the hash that needs to get signed for index `inputIndex`
   * @param {number} inputIndex
   */
  async sigHash(inputIndex) {
    const inputs = await Promise.all(
      this.txIns.map((i, index) =>
        i.serializeForSigning(index === inputIndex, this.testnet)
      )
    );

    const serialization = Buffer.concat([
      this.version.toArrayLike(Buffer, "le", 4),
      BufferWriter.toVarIntNum(this.txIns.length),
      Buffer.concat(inputs),
      BufferWriter.toVarIntNum(this.txOuts.length),
      Buffer.concat(this.txOuts.map(o => o.serialize())),
      Buffer.from(this.locktime).reverse(),
      SIGHASH_ALL // hardcoded
    ]);
    // console.log(serialization);
    return new BN(sha256(serialization), "hex", "be");
  }

  /**
   * Verify this transaction
   */
  async verify() {
    await this.fee();
    if (this.fee < 0) {
      return false;
    }

    for (let i = 0; i < this.txIns.length; i += 1) {
      const ok = await this.verifyInput(i);
      if (!ok) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns whether the input has a valid signature
   * @param {number} inputIndex
   */
  async verifyInput(inputIndex) {
    const input = this.txIns[inputIndex];
    await input.populateFromPrevOut(this.testnet);
    const z = await this.sigHash(inputIndex);
    const comb = Script.combine(input.scriptSig, input.scriptPubKey);
    return comb.evaluate(z);
  }

  /**
   * @param {number} inputIndex
   * @param {PrivateKey} privateKey
   */
  async signInput(inputIndex, privateKey) {
    const z = await this.sigHash(inputIndex);
    const der = privateKey.sign(z).der();
    const sig = Buffer.concat([der, SIGHASH_ALL_ONE]);
    const sec = privateKey.point.sec();
    const scriptSig = new Script([sig, sec]);
    this.txIns[inputIndex].scriptSig = scriptSig;
    return this.verifyInput(inputIndex);
  }
}

module.exports = { TxIn, Tx };
