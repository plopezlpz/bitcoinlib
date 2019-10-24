const BN = require("bn.js");
const toBN = require("./utils/num");

// private functions
function validate(self, other) {
  if (!self.prime.eq(other.prime)) {
    throw Error("operation not valid for numbers of different fields");
  }
}

/**
 * Finite field element math
 */
class FieldElement {
  /**
   * @param {number|string|BN} num The number in the field
   * @param {number|string|BN} prime The prime of the field
   * @param {string} [rc] Reduction context
   */
  constructor(num, prime, rc) {
    /** @type {BN} */
    this.num = toBN(num);
    /** @type {BN} */
    this.prime = toBN(prime);

    if (this.num.gte(this.prime) || this.num.lt(0)) {
      throw Error(`Num ${num} not in field range 0 to ${prime - 1}`);
    }

    this.red = BN.red(rc || this.prime); // TODO use "k256"
    this.redNum = this.num.toRed(this.red);
  }

  /**
   * @param {FieldElement} other
   * @returns {boolean}
   */
  equals(other) {
    return this.num.eq(other.num) && this.prime.eq(other.prime);
  }

  /**
   * @param {FieldElement} other
   * @returns {FieldElement} a new element with the result
   */
  plus(other) {
    validate(this, other);
    const num = this.num.add(other.num).umod(this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * @param {FieldElement} other
   * @returns {FieldElement} a new element with the result
   */
  minus(other) {
    validate(this, other);
    const num = this.num.sub(other.num).umod(this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * @param {FieldElement} other
   * @returns {FieldElement} a new element with the result
   */
  times(other) {
    validate(this, other);
    const num = this.num.mul(other.num).umod(this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * @param {string|number|BN} exponent
   * @returns {FieldElement} a new element with the result
   */
  pow(exponent) {
    const n = toBN(exponent).umod(this.prime.sub(new BN(1)));
    const res = this.redNum.redPow(n);
    return new FieldElement(res.fromRed(), this.prime);
  }

  /**
   * @param {FieldElement} other
   * @returns {FieldElement} a new element with the result
   */
  div(other) {
    validate(this, other);
    // 1/other
    const otherInv = other.pow(this.prime.sub(new BN(2)));
    const num = this.num.mul(otherInv.num).umod(this.prime);
    return new FieldElement(num, this.prime);
  }

  toString() {
    return `FieldElement_${this.prime.toString(10)}(${this.num.toString(10)})`;
  }
}

module.exports = FieldElement;
