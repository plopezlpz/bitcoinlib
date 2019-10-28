const BN = require("bn.js");
const { sha256 } = require("js-sha256");
const { Buffer } = require("buffer");
const { G, N } = require("./Point");
const Signature = require("./Signature");
const { toBN, toOrderN } = require("../utils/num");
const { base58Checksum } = require("../utils/encoding");
// TODO for react-native:
// npm install buffer --save
// import { Buffer } from 'buffer';
// global.Buffer = Buffer; // very important in your App.js (or use the Buffer only here)

const N2 = new BN(2);

class PrivateKey {
  /**
   * @param {string|number|BN} secret
   */
  constructor(secret) {
    this.secret = toBN(secret);
    this.point = G.sMul(secret);
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
    const r = G.sMul(k).x;

    const kInv = toOrderN(k).redInvm();
    // prettier-ignore
    let s = toOrderN(r.mul(this.secret).add(z)).redMul(kInv);
    // using low-s value will get nodes to relay our tx (this is for malleability reasons)
    // see BIP 62, "low S values in signatures"
    if (s.lt(N.div(N2))) {
      s = N.sub(s);
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
    let v = Buffer.alloc(32);
    v.fill(0x01);
    let k = Buffer.alloc(32);
    k.fill(0x00);

    if (z.gt(N)) {
      // eslint-disable-next-line no-param-reassign
      z = z.minus(N);
    }

    const secretBuff = this.secret.toArrayLike(Buffer, "be", 32);
    const zBuff = z.toArrayLike(Buffer, "be", 32);
    // prettier-ignore
    k = sha256.hmac.arrayBuffer(k, Buffer.concat([v, Buffer.from([0x00]), secretBuff, zBuff]));
    v = sha256.hmac.arrayBuffer(k, v);
    // prettier-ignore
    k = sha256.hmac.arrayBuffer(k, Buffer.concat([Buffer.from(v), Buffer.from([0x01]), secretBuff, zBuff]))
    v = sha256.hmac.arrayBuffer(k, v);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      v = sha256.hmac.arrayBuffer(k, v);
      const vBuff = Buffer.from(v);
      const candidate = toBN(`0x${vBuff.toString("hex")}`);
      if (candidate.gte(new BN(1)) && candidate.lt(N)) {
        return candidate;
      }
      // prettier-ignore
      k = sha256.hmac.arrayBuffer(k, Buffer.concat([vBuff, Buffer.from([0x01]), secretBuff, zBuff]))
      v = sha256.hmac.arrayBuffer(k, v);
    }
  }

  wif(compressed = true, testnet = false) {
    const secretBytes = this.secret.toArrayLike(Buffer, "be", 32);
    const prefix = testnet ? 0xef : 0x80;
    if (compressed) {
      return base58Checksum(
        Buffer.concat([Buffer.from([prefix]), secretBytes, Buffer.from([0x01])])
      );
    }
    return base58Checksum(Buffer.concat([Buffer.from([prefix]), secretBytes]));
  }
}

module.exports = PrivateKey;
