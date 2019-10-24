const BN = require("bn.js");
const FieldElement = require("./FieldElement");

// prettier-ignore
const P = new BN(2).pow(new BN(256)).sub(new BN(2).pow(new BN(32))).sub(new BN(977));

/**
 * Public point for the private key
 */
class S256Field extends FieldElement {
  /**
   * @param {number|string|BN} num The number in the field
   */
  constructor(num) {
    super(num, P, "k256");
  }

  toString() {
    return this.num.toString(10).padStart(64, "0");
  }
}

module.exports = S256Field;
