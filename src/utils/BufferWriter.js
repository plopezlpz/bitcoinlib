const { concat } = require("lodash");
const { Buffer } = require("buffer");

class BufferWriter {
  constructor() {
    this.bufs = [];
    this.bufLen = 0;
  }

  write(buf) {
    this.bufs.push(buf);
    this.bufLen += buf.length;
    return this;
  }

  writeUInt8(n) {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
    this.write(buf);
    return this;
  }

  writeUInt16LE(n) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16LE(n, 0);
    this.write(buf);
    return this;
  }

  toBuf() {
    return Buffer.concat(this.bufs);
  }

  toBufWithVarIntSize() {
    const all = concat([BufferWriter.toVarIntNum(this.bufLen)], this.bufs);
    return Buffer.concat(all);
  }

  // TODO not entirely sure about this
  static toVarIntNum(n) {
    if (typeof n !== "number") {
      throw Error(`${n} is not a number`);
    }
    let buf;
    if (n < 253) {
      buf = Buffer.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = Buffer.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16LE(n, 1);
    } else if (n < 0x100000000) {
      buf = Buffer.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32LE(n, 1);
    } else {
      buf = Buffer.alloc(1 + 8);
      buf.writeUInt8(255, 0);
      // eslint-disable-next-line no-bitwise
      buf.writeInt32LE(n & -1, 1);
      buf.writeUInt32LE(Math.floor(n / 0x100000000), 5);
    }
    return buf;
  }
}

module.exports = BufferWriter;
