const { Buffer } = require("buffer");
// eslint-disable-next-line no-unused-vars
const BN = require("bn.js");
// eslint-disable-next-line no-unused-vars
const BufferReader = require("../utils/BufferReader");
const Script = require("../script/Script");

class TxOut {
  constructor(amount, scriptPubKey) {
    /**
     * @type {BN}
     */
    this.amount = amount;
    /**
     * @type {Script}
     */
    this.scriptPubKey = scriptPubKey;
  }

  /**
   * @param {BufferReader} br
   */
  static parse(br) {
    const amount = br.readBN(8);
    const scriptPubKey = Script.parse(br);
    return new TxOut(amount, scriptPubKey);
  }

  serialize() {
    return Buffer.concat([
      Buffer.from(this.amount.toArrayLike(Buffer, "le", 8)),
      this.scriptPubKey.serialize()
    ]);
  }
}

module.exports = TxOut;
