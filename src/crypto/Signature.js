// eslint-disable-next-line no-unused-vars
const BN = require("bn.js");
const { Buffer } = require("buffer");
const { toBN } = require("../utils/num");
const BufferReader = require("../utils/BufferReader");

function lstrip(buffer, byte) {
  let pos;
  for (let i = 0; i <= buffer.length; i += 1) {
    if (buffer[i] !== byte) {
      pos = i;
      break;
    }
  }
  return buffer.slice(pos);
}

/**
 * @param {BufferReader} br
 */
function parseEl(br) {
  const marker = br.read(1)[0];
  if (marker !== 0x02) {
    throw Error("Bad signature");
  }
  const length = br.read(1)[0];
  const el = br.readBN(length, "be");
  return { length, el };
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

  /**
   * @param {Buffer} der
   */
  static parse(der) {
    const br = new BufferReader(der);
    const compound = br.read(1)[0];
    if (compound !== 0x30) {
      throw Error("Bad signature");
    }
    const length = br.read(1)[0];
    if (length + 2 !== der.byteLength) {
      throw Error("Bad signature length");
    }
    const r = parseEl(br);
    const s = parseEl(br);
    if (der.byteLength !== 6 + r.length + s.length) {
      throw Error("Signature too long");
    }
    return new Signature(r.el, s.el);
  }

  toString(radix) {
    return `Signature(${this.r.toString(radix)}, ${this.s.toString(radix)})`;
  }
}

module.exports = Signature;
