const BigNumber = require("bignumber.js");

class Signature {
  /**
   * @param {string|number|BigNumber.BigNumber} r
   * @param {string|number|BigNumber.BigNumber} s
   */
  constructor(r, s) {
    this.r = BigNumber(r);
    this.s = BigNumber(s);
  }

  toString() {
    return `Signature(${this.r}, ${this.s})`;
  }
}

module.exports = Signature;
