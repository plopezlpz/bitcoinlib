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
  constructor(num, prime) {
    this.num = BigNumber(num);
    this.prime = BigNumber(prime);

    if (this.num.gte(this.prime) || this.num.lt(0)) {
      throw Error(`Num ${num} not in field range 0 to ${prime - 1}`);
    }
  }

  equals(other) {
    return this.num.eq(other.num) && this.prime.eq(other.prime);
  }

  add(other) {
    validate(this, other);
    const num = this.num.plus(other.num).mod(this.prime);
    return new FieldElement(num, this.prime);
  }

  sub(other) {
    validate(this, other);
    const num = this.num.minus(other.num).mod(this.prime);
    return new FieldElement(num, this.prime);
  }

  mul(other) {
    validate(this, other);
    const num = this.num.times(other.num).mod(this.prime);
    return new FieldElement(num, this.prime);
  }

  pow(exponent) {
    const n = BigNumber(exponent).mod(this.prime - 1);
    const num = this.num.pow(n, this.prime);
    return new FieldElement(num, this.prime);
  }

  div(other) {
    validate(this, other);
    // 1/other
    const oneOverOther = other.pow(this.prime - 2);
    return this.mul(oneOverOther);
  }
}

module.exports = FieldElement;
