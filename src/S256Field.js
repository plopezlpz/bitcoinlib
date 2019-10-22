const BigNumber = require("bignumber.js");
const FieldElement = require("./FieldElement");

// prettier-ignore
const P = BigNumber(2).pow(256).minus(BigNumber(2).pow(32)).minus(977);

/**
 * Public point for the private key
 */
class S256Field extends FieldElement {
  constructor(num) {
    super(num, P);
  }

  toString() {
    return this.num.toString(10).padStart(64, "0");
  }
}

module.exports = S256Field;
