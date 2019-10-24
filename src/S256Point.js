const BigNumber = require("bignumber.js");
// eslint-disable-next-line no-unused-vars
const Signature = require("./Signature");
const Point = require("./Point");
const S256Field = require("./S256Field");

const A = new S256Field(0);
const B = new S256Field(7);
// prettier-ignore
/** @type {BigNumber.BigNumber} */
const N = BigNumber("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");

function toS256Field(num) {
  if (num instanceof S256Field) {
    return num;
  }
  if (
    num instanceof Number ||
    num instanceof String ||
    typeof num === "string" ||
    num instanceof BigNumber
  ) {
    return new S256Field(num);
  }
  throw Error(`Not a valid number ${num}`);
}

class S256Point extends Point {
  /**
   * Point in the sec256k1 curve
   * @param {string|number|BigNumber.BigNumber} x The x element
   * @param {string|number|BigNumber.BigNumber} y The y element
   */
  constructor(x, y) {
    super(toS256Field(x), toS256Field(y), A, B);
  }

  /**
   * Scalar multiplication
   * @param {string|number|BigNumber.BigNumber} coefficient The scalar to multiply this point to
   * @returns {S256Point} A point in the curve
   */
  stimes(coefficient) {
    const coef = BigNumber(coefficient).mod(N);
    return super.stimes(coef);
  }

  /**
   * @param {string|number|BigNumber.BigNumber} z
   * @param {Signature} sig
   * @returns {boolean} true if valid, false otherwise
   */
  // prettier-ignore
  verify(z, sig) {
    const sInv = sig.s.pow(N.minus(2), N);
    const u = BigNumber(z).times(sInv).mod(N);
    const v = sig.r.times(sInv).mod(N);
    // eslint-disable-next-line no-use-before-define
    const total = G.stimes(u).plus(this.stimes(v));
    return total.x.num.eq(sig.r);
  }
}

const G = new S256Point(
  "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
  "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
);

module.exports = {
  S256Point,
  G,
  N
};
