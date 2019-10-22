const BigNumber = require("bignumber.js");
const Point = require("./Point");
const S256Field = require("./S256Field");

const A = new S256Field(0);
const B = new S256Field(7);
// prettier-ignore
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
  constructor(x, y) {
    super(toS256Field(x), toS256Field(y), A, B);
  }

  stimes(coefficient) {
    const coef = BigNumber(coefficient).mod(N);
    return super.stimes(coef);
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
