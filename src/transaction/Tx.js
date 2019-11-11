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

class TxIn {
  constructor(prevTx, prevIndex, scriptSig, sequence = 0xffffffff) {
    /** @type {Buffer} */
    this.prevTx = prevTx;
    /** @type {BN} */
    this.prevIndex = prevIndex;
    /** @type {Script} */
    this.scriptSig = scriptSig || new Script();
    this.sequence = sequence;

    // *******************************
    // Coming from the corresponding previous tx output:
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
  async serializeForSigning(isIdxToSign) {
    if (isIdxToSign) {
      await this.populateFromPrevOut();
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
      Buffer.from(this.sequence).reverse()
    ]);
  }

  async populateFromPrevOut() {
    // eslint-disable-next-line no-use-before-define
    const tx = await fetchTx(this.prevTx.toString("hex"), Tx.parse);
    this.amount = tx.txOuts[this.prevIndex].amount;
    this.scriptPubKey = tx.txOuts[this.prevIndex].scriptPubKey;
  }

  async value(parseTxFn) {
    const tx = await fetchTx(this.prevTx.toString("hex"), parseTxFn);
    this.amount = tx.txOuts[this.prevIndex].amount;
  }

  async scriptPubKey(parseTxFn) {
    const tx = await fetchTx(this.prevTx.toString("hex"), parseTxFn);
    this.scriptPubKey = tx.txOuts[this.prevIndex].scriptPubKey;
  }
}

class Tx {
  constructor(version, txIns, txOuts, locktime, testnet = false) {
    this.version = version;
    /**
     * @type {TxIn[]}
     */
    this.txIns = txIns;
    /**
     * @type {TxOut[]}
     */
    this.txOuts = txOuts;
    this.locktime = locktime;
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
      uniqBy(this.txIns, i => i.prevTx).map(i => i.value(Tx.parse))
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
      this.txIns.map((i, index) => i.serializeForSigning(index === inputIndex))
    );

    const serialization = Buffer.concat([
      this.version.toArrayLike(Buffer, "le", 4),
      BufferWriter.toVarIntNum(this.txIns.length),
      Buffer.concat(inputs),
      BufferWriter.toVarIntNum(this.txOuts.length),
      Buffer.concat(this.txOuts.map(o => o.serialize())),
      Buffer.from(this.locktime).reverse(),
      Buffer.from([1, 0, 0, 0]) // SIGHASH_ALL hardcoded
    ]);
    return new BN(sha256(serialization), "hex", "be");
  }
}

module.exports = Tx;
