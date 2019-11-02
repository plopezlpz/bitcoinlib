// eslint-disable-next-line no-unused-vars
const BufferReader = require("../utils/BufferReader");

class TxIn {
  constructor(prevTx, prevIndex, scriptSig, sequence = 0xffffffff) {
    this.prevTx = prevTx;
    this.prevIndex = prevIndex;
    this.scriptSig = scriptSig; // TODO || new Script();
    this.sequence = sequence;
  }

  /**
   * @param {BufferReader} br buffer reader
   */
  static parse(br) {
    const prevTx = br.read(32);
    const prevIndex = br.readBN(4).toNumber();
    // TODO will be Script.parse
    const scriptSig = br.readVarLenBuf();
    const sequence = br.read(4);

    return new TxIn(prevTx, prevIndex, scriptSig, sequence);
  }
}

module.exports = TxIn;
