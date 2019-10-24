// eslint-disable-next-line no-unused-vars
const BN = require("bn.js");
const toBN = require("./utils/num");

class Signature {
  /**
   * @param {string|number|BN} r
   * @param {string|number|BN} s
   */
  constructor(r, s) {
    this.r = toBN(r);
    this.s = toBN(s);
  }

  toString() {
    return `Signature(${this.r}, ${this.s})`;
  }
}

module.exports = Signature;
