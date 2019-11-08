const { Buffer } = require("buffer");
// eslint-disable-next-line no-unused-vars
const BN = require("bn.js");
// eslint-disable-next-line no-unused-vars
const BufferReader = require("../utils/BufferReader");
const { fetchTx } = require("./txFetcher");
const Script = require("../script/Script");

class TxIn {
  constructor(prevTx, prevIndex, scriptSig, sequence = 0xffffffff) {
    /**
     * @type {Buffer}
     */
    this.prevTx = prevTx;
    /**
     * @type {BN}
     */
    this.prevIndex = prevIndex;
    /**
     * @type {Script}
     */
    this.scriptSig = scriptSig || new Script();
    this.sequence = sequence;

    // Coming from the corresponding previous tx output:
    this.amount = undefined;
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
      this.prevTx.reverse(),
      this.prevIndex.toArrayLike(Buffer, "le", 4),
      this.scriptSig.serialize(),
      this.sequence.reverse()
    ]);
  }

  value(parseTxFn) {
    return fetchTx(this.prevTx.toString("hex"), parseTxFn).then(tx => {
      this.amount = tx.txOuts[this.prevIndex].amount;
    });
  }

  scriptPubKey(parseTxFn) {
    return fetchTx(this.prevTx.toString("hex"), parseTxFn).then(tx => {
      this.scriptPubKey = tx.txOuts[this.prevIndex].scriptPubKey;
    });
  }
}

module.exports = TxIn;
