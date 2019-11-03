const { Buffer } = require("buffer");
// eslint-disable-next-line no-unused-vars
const BN = require("bn.js");
// eslint-disable-next-line no-unused-vars
const BufferReader = require("../utils/BufferReader");
const { fetchTx } = require("./txFetcher");

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
    this.scriptSig = scriptSig; // TODO || new Script();
    this.sequence = sequence;
  }

  /**
   * @param {BufferReader} br buffer reader
   */
  static parse(br) {
    const prevTx = br.read(32);
    const prevIndex = br.readBN(4);
    // TODO will be Script.parse
    const scriptSig = br.readVarLenBuf();
    const sequence = br.read(4);

    return new TxIn(prevTx, prevIndex, scriptSig, sequence);
  }

  serialize() {
    return Buffer.concat([
      this.prevTx.reverse(),
      this.prevIndex.toArrayLike(Buffer, "le", 4),
      BufferReader.toVarIntNum(this.scriptSig.byteLength),
      this.scriptSig.reverse(), // TODO script
      this.sequence.reverse()
    ]);
  }
}

module.exports = TxIn;
