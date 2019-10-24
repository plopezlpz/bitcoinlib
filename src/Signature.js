const BigNumber = require("bignumber.js");

class Signature {
  /**
   * @param {string|number|BigNumber.BigNumber} r
   * @param {string|number|BigNumber.BigNumber} s
   */
  constructor(r, s) {
    /** @type {BigNumber.BigNumber} */
    this.r = BigNumber(r);
    /** @type {BigNumber.BigNumber} */
    this.s = BigNumber(s);
  }

  toString() {
    return `Signature(${this.r}, ${this.s})`;
  }
}

module.exports = Signature;
