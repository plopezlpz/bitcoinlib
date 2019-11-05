const { uniqBy } = require("lodash");
const { Buffer } = require("buffer");
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
    const locktime = br.read(4);

    return new Tx(version, txIns, txOuts, locktime);
  }

  serialize() {
    return Buffer.concat([
      this.version.toArrayLike(Buffer, "le", 4),
      BufferReader.toVarIntNum(this.txIns.length),
      Buffer.concat(this.txIns.map(i => i.serialize())),
      BufferReader.toVarIntNum(this.txOuts.length),
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
}

module.exports = Tx;
