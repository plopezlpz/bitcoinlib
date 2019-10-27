const { Buffer } = require("buffer");
const { toK256, toBN, toOrderN } = require("../utils/num");
// eslint-disable-next-line no-unused-vars
const Signature = require("./Signature");

/**
 * The order of the group
 */
// prettier-ignore
const N = toBN("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
// prettier-ignore
const P = toK256("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");

const A = toK256(0);
const B = toK256(7);

const N2 = toBN(2);
const N3 = toBN(3);

const R0 = toK256(0);
const R2 = toK256(2);
const R3 = toK256(3);

/**
 * Point in the secp256k1 curve:
 * `y^2 != x^3 + 7`
 * This is the ECDSA public key
 */
class Point {
  /**
   * Point in the secp256k1 curve
   * @param {string|number|BN} x
   * @param {string|number|BN} y
   */
  constructor(x, y) {
    this.x = toK256(x);
    this.y = toK256(y);

    if (this.x === Infinity && this.y === Infinity) {
      return;
    }

    // this.y**2 != this.x**3 + a * x + b:
    // prettier-ignore
    if (!this.y.redPow(N2).eq(this.x.redPow(N3).redAdd(B))) {
      throw Error(`(${this.x.toString()}, ${this.y.toString()}) is not in the curve`);
    }
  }

  /**
   * @param {Point} other
   * @returns {boolean}
   */
  eq(other) {
    return (
      (this.x === other.x || this.x.eq(other.x)) &&
      (this.y === other.y || this.y.eq(other.y))
    );
  }

  /**
   * @param {Point} other
   * @returns {Point} the resulting point
   */
  add(other) {
    // Case 0.0 this is point at infinity, return other
    if (this.x === Infinity) {
      return other;
    }
    // Case 0.1 other is point at infinity, return this
    if (other.x === Infinity) {
      return this;
    }
    // Case 1: self.x == other.x, self.y != other.y
    // Result is point at infinity
    if (this.x.eq(other.x) && !this.y.eq(other.y)) {
      return new Point(Infinity, Infinity, A, B);
    }

    // Case 2: self.x ≠ other.x
    // Formula (x3,y3)==(x1,y1)+(x2,y2)
    // s=(y2-y1)/(x2-x1)
    // x3=s**2-x1-x2
    // y3=s*(x1-x3)-y1
    // prettier-ignore
    if (!this.x.eq(other.x)) {
      const inv = other.x.redSub(this.x).redInvm();
      const s = (other.y.redSub(this.y)).redMul(inv);
      const x = s.redPow(N2).redSub(this.x).redSub(other.x);
      const y = s.redMul(this.x.redSub(x)).redSub(this.y);
      return new Point(x, y);
    }

    // Case 4: if we are tangent to the vertical line,
    // we return the point at infinity
    // note instead of figuring out what 0 is for each type
    // we just use 0 * self.x
    // prettier-ignore
    if (this.eq(other) && this.y.eq(this.x.redMul(R0))) {
      return new Point(Infinity, Infinity, A, B);
    }

    // Case 3: self == other
    // Formula (x3,y3) = (x1,y1)+(x1,y1)
    // s = (3 * x1**2 + a) / (2 * y1)
    // x3 = s**2 - 2 * x1
    // y3 = s * (x1 - x3) - y1
    // prettier-ignore
    if (this.eq(other)) {
      const s = (this.y.redMul(R2).redInvm())
                .redMul(
                ((this.x.redPow(N2).redMul(R3)).redAdd(A)));
      const x = s.redPow(N2).redSub(this.x.redMul(R2));
      const y = s.redMul(this.x.redSub(x)).redSub(this.y);
      return new Point(x, y);
    }
    throw Error(`could not add ${this.toString()} + ${other.toString()}`);
  }

  /**
   * Scalar multiplication
   * @param {string|number|BN} coefficient The scalar to multiply for
   */
  sMul(coefficient) {
    // TODO maybe use the binary stuff instead of the string things
    let coef = toBN(coefficient).toString(2); // binary representation
    let current = this;
    let result = new Point(Infinity, Infinity);

    while (coef) {
      if (coef.endsWith("1")) {
        result = result.add(current);
      }
      current = current.add(current);
      coef = coef.slice(0, -1);
    }
    return result;
  }

  /**
   * @param {string|number|BN} z
   * @param {Signature} sig
   * @returns {boolean} true if valid, false otherwise
   */
  // prettier-ignore
  verify(z, sig) {
    // TODO improve more the performance
    const sInv = toOrderN(sig.s).redInvm();

    const u = toOrderN(z).redMul(sInv).fromRed();
    const v = toOrderN(sig.r).redMul(sInv).fromRed();

    // eslint-disable-next-line no-use-before-define
    const total = G.sMul(u).add(this.sMul(v));
    return total.x.eq(sig.r);
  }

  /**
   * Returns the buffer version of the sec format
   */
  sec(compressed = true) {
    if (compressed) {
      const yEvenMarker = this.y.isEven() ? 0x02 : 0x03;
      return Buffer.concat([
        Buffer.from([yEvenMarker]),
        this.x.toArrayLike(Buffer, "be", 32)
      ]);
    }
    return Buffer.concat([
      Buffer.from([0x04]),
      this.x.toArrayLike(Buffer, "be", 32),
      this.y.toArrayLike(Buffer, "be", 32)
    ]);
  }

  /**
   * Returns a Point from a sec buffer
   * @param {Buffer} sec // maybe a hex string better?
   */
  static parse(sec) {
    if (sec[0] === 0x04) {
      return new Point(
        `0x${sec.slice(1, 33).toString("hex")}`,
        `0x${sec.slice(33, 65).toString("hex")}`
      );
    }
    const isEven = sec[0] === 0x02;
    // right side of the equation y^2 = x^3 + 7
    // prettier-ignore
    const x = toK256(`0x${sec.slice(1).toString("hex")}`)
    const alpha = x.redPow(N3).add(B);
    // solve for left side
    const beta = toK256(alpha).redSqrt();
    let evenBeta;
    let oddBeta;
    if (beta.isEven()) {
      evenBeta = beta;
      oddBeta = P.redSub(beta);
    } else {
      evenBeta = P.redSub(beta);
      oddBeta = beta;
    }
    if (isEven) {
      return new Point(x.fromRed(), evenBeta.fromRed());
    }
    return new Point(x.fromRed(), oddBeta.fromRed());
  }

  // prettier-ignore
  toString(radix) {
    if (this.x === Infinity) {
      return `Point(Infinity)_${A.toString()}_${B.toString()}`
    } 
    return `Point(${this.x.toString(radix)}, ${this.y.toString(radix)})_${A.toString()}_${B.toString()}`;
  }
}

const G = new Point(
  "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
  "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
);

module.exports = { Point, G, N };
