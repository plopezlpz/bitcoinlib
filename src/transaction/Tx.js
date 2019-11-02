const BufferReader = require("../utils/BufferReader");
const TxIn = require("./TxIn");
const TxOut = require("./TxOut");
const { N0, N1 } = require("../utils/num");

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

    return new Tx(version, txIns, txOuts);
  }
}

module.exports = Tx;
