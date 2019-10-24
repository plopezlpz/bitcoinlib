const BN = require("bn.js");
const toBN = require("./utils/num");
// eslint-disable-next-line no-unused-vars
const Signature = require("./Signature");
const Point = require("./Point");
const S256Field = require("./S256Field");

const A = new S256Field(0);
const B = new S256Field(7);
// prettier-ignore
const N = new BN("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", "hex");

function toS256Field(num) {
  return num instanceof S256Field ? num : new S256Field(toBN(num));
}

class S256Point extends Point {
  /**
   * Point in the sec256k1 curve
   * @param {string|number|BN} x The x element
   * @param {string|number|BN} y The y element
   */
  constructor(x, y) {
    super(toS256Field(x), toS256Field(y), A, B);
  }

  /**
   * Scalar multiplication
   * @param {string|number|BN} coefficient The scalar to multiply this point to
   * @returns {S256Point} A point in the curve
   */
  stimes(coefficient) {
    const coef = toBN(coefficient).umod(N);
    return super.stimes(coef);
  }

  /**
   * @param {string|number|BN} z
   * @param {Signature} sig
   * @returns {boolean} true if valid, false otherwise
   */
  // prettier-ignore
  verify(z, sig) {
    // TODO improve more the performance
    const ctx = BN.red(N);

    const redS = sig.s.toRed(ctx);
    const sInv = redS.redInvm();

    const redZ = toBN(z).toRed(ctx);
    const u = redZ.redIMul(sInv).fromRed();

    const redR = sig.r.toRed(ctx);
    const v = redR.redIMul(sInv).fromRed();
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
