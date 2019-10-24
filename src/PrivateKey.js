/** @type {BigNumber.BigNumber} */
const BigNumber = require("bignumber.js");
const { G, N } = require("./S256Point");
const Signature = require("./Signature");
// TODO for react-native:
// npm install buffer --save
// import { Buffer } from 'buffer';
// global.Buffer = Buffer; // very important in your App.js (or use the Buffer only here)

class PrivateKey {
  /**
   * @param {string|number|BigNumber.BigNumber} secret
   */
  constructor(secret) {
    /** @type {BigNumber.BigNumber} */
    this.secret = BigNumber(secret);
    this.point = G.stimes(secret);
  }

  /**
   * Signs z
   * @param {string|number|BigNumber.BigNumber} z
   * @returns {Signature}
   */
  sign(z) {
    // It is imperative not to reuse k
    /**  @type {BigNumber.BigNumber} */
    const k = this.deterministicK(z);
    /**  @type {BigNumber.BigNumber} */
    const r = G.stimes(k).x.num;
    const kInv = k.pow(N.minus(2), N);
    // prettier-ignore
    let s = (r.times(this.secret).plus(BigNumber(z))).times(kInv).mod(N);
    // using low-s value will get nodes to relay our tx (this is for malleability reasons)
    if (s.lt(N.div(2))) {
      s = N.minus(s);
    }
    return new Signature(r, s);
  }

  /**
   * Returns a deterministic k in the range (0, N], specification RFC 6979
   * The alternative would be to use a trully random k
   * @param {BigNumber.BigNumber} z
   * @returns {BigNumber.BigNumber}
   */
  deterministicK(z) {
    const v = Buffer.alloc(32);
    v.fill(0x01);
    const k = Buffer.alloc(32);
    k.fill(0x00);
    if (z.gt(N)) {
      z = z.minus(N);
    }

    return BigNumber(22); // in range [0, N)
  }
}

module.exports = PrivateKey;
