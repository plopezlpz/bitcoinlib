// eslint-disable-next-line no-unused-vars
const BN = require("bn.js");
// eslint-disable-next-line no-unused-vars
const BufferReader = require("../utils/BufferReader");

class TxOut {
  constructor(amount, scriptPubKey) {
    /**
     * @type {BN}
     */
    this.amount = amount;
    this.scriptPubKey = scriptPubKey;
  }

  /**
   * @param {BufferReader} br
   */
  static parse(br) {
    const amount = br.readBN(8);
    // TODO use script parse
    const scriptPubKey = br.readVarLenBuf();
    return new TxOut(amount, scriptPubKey);
  }
}

module.exports = TxOut;
