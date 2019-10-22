const BigNumber = require("bignumber.js");

// Configure the modulo
BigNumber.config({ MODULO_MODE: BigNumber.EUCLID });

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
   * @param {number|string|BigNumber.BigNumber} num The number in the field
   * @param {number|string|BigNumber.BigNumber} prime The prime of the field
   */
  constructor(num, prime) {
    this.num = BigNumber(num);
    this.prime = BigNumber(prime);

    if (this.num.gte(this.prime) || this.num.lt(0)) {
      throw Error(`Num ${num} not in field range 0 to ${prime - 1}`);
    }
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
    const num = this.num.plus(other.num).mod(this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * @param {FieldElement} other
   * @returns {FieldElement} a new element with the result
   */
  minus(other) {
    validate(this, other);
    const num = this.num.minus(other.num).mod(this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * @param {FieldElement} other
   * @returns {FieldElement} a new element with the result
   */
  times(other) {
    validate(this, other);
    const num = this.num.times(other.num).mod(this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * @param {string|number|BigNumber.BigNumber} exponent
   * @returns {FieldElement} a new element with the result
   */
  pow(exponent) {
    const n = BigNumber(exponent).mod(this.prime.minus(1));
    const num = this.num.pow(n, this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * @param {FieldElement} other
   * @returns {FieldElement} a new element with the result
   */
  div(other) {
    validate(this, other);
    // 1/other
    const otherInv = other.num.pow(this.prime.minus(2), this.prime);
    const num = this.num.times(otherInv).mod(this.prime);
    return new FieldElement(num, this.prime);
  }

  toString() {
    return `FieldElement_${this.prime.toString(10)}(${this.num.toString(10)})`;
  }
}

module.exports = FieldElement;
