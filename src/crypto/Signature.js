// eslint-disable-next-line no-unused-vars
const BN = require("bn.js");
const { Buffer } = require("buffer");
const { toBN } = require("../utils/num");

function lstrip(buffer, byte) {
  let pos;
  for (let i = 0; i <= buffer.length; i++) {
    if (buffer[i] !== byte) {
      pos = i;
      break;
    }
  }
  return buffer.slice(pos);
}

/**
 *
 * @param {BN} val
 */
function toDerVal(val) {
  let buff = val.toArrayLike(Buffer, "be", 32);
  buff = lstrip(buff, 0x00);
  // eslint-disable-next-line no-bitwise
  if (buff[0] & 0x80) {
    buff = Buffer.concat([Buffer.from([0x00]), buff]);
  }
  return Buffer.concat([
    Buffer.from([0x02], undefined, 1),
    Buffer.from(buff.length.toString(16), "hex", 1),
    Buffer.from(buff)
  ]);
}

class Signature {
  /**
   * @param {string|number|BN} r
   * @param {string|number|BN} s
   */
  constructor(r, s) {
    this.r = toBN(r);
    this.s = toBN(s);
  }

  der() {
    const r = toDerVal(this.r);
    const s = toDerVal(this.s);
    const len = r.length + s.length;
    return Buffer.concat([
      Buffer.from([0x30], undefined, 1),
      Buffer.from(len.toString(16), "hex", 1),
      r,
      s
    ]);
  }

  toString(radix) {
    return `Signature(${this.r.toString(radix)}, ${this.s.toString(radix)})`;
  }
}

module.exports = Signature;
