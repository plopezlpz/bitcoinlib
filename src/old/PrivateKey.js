const BN = require("bn.js");
const { G, N } = require("./S256Point");
const Signature = require("../crypto/Signature");
const { toBN } = require("../utils/num");
// TODO for react-native:
// npm install buffer --save
// import { Buffer } from 'buffer';
// global.Buffer = Buffer; // very important in your App.js (or use the Buffer only here)

class PrivateKey {
  /**
   * @param {string|number|BN} secret
   */
  constructor(secret) {
    this.secret = toBN(secret);
    this.point = G.stimes(secret);
  }

  /**
   * Signs z
   * @param {string|number|BN} z
   * @returns {Signature}
   */
  sign(z) {
    // eslint-disable-next-line no-param-reassign
    z = toBN(z);
    // It is imperative not to reuse k
    const k = this.deterministicK(z);
    /** @type {BN} */
    const r = G.stimes(k).x.num;

    const ctx = BN.red(N);

    const kInv = k.toRed(ctx).redInvm();
    // prettier-ignore
    let s = (r.mul(this.secret).add(z)).toRed(ctx).redIMul(kInv);
    // using low-s value will get nodes to relay our tx (this is for malleability reasons)
    if (s.lt(N.div(new BN(2)))) {
      s = N.minus(s);
    }
    return new Signature(r, s);
  }

  /**
   * Returns a deterministic k in the range (0, N], specification RFC 6979
   * The alternative would be to use a trully random k
   * @param {string|number|BN} z
   * @returns {BN}
   */
  deterministicK(z) {
    const v = Buffer.alloc(32);
    v.fill(0x01);
    const k = Buffer.alloc(32);
    k.fill(0x00);
    if (z.gt(N)) {
      z = z.minus(N);
    }

    return new BN(22); // in range [0, N)
  }
}

module.exports = PrivateKey;
