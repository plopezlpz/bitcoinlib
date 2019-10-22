const BigNumber = require("bignumber.js");

class Signature {
  constructor(r, s) {
    /**
     * @type BigNumber
     */
    this.r = BigNumber(r);
    /**
     * @type BigNumber
     */
    this.s = BigNumber(s);
  }

  toString() {
    return `Signature(${this.r}, ${this.s})`;
  }
}

module.exports = Signature;
