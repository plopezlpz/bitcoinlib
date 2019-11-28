const { Buffer } = require("buffer");
const BN = require("bn.js");

function toBuf(val) {
  if (val instanceof Buffer) {
    return val;
  }
  if (typeof val === "string") {
    return Buffer.from(val, "hex");
  }
  if (val instanceof Array) {
    return Buffer.from(val);
  }
  throw Error(`unrecognized buffer format for ${val}`);
}

class BufferReader {
  /**
   * @param {Buffer|string|Array} buffer
   */
  constructor(buffer) {
    /**
     * @private
     */
    this.buf = toBuf(buffer);
    /**
     * @private
     */
    this.pos = 0;
  }

  static from(buffer) {
    return new BufferReader(buffer);
  }

  isEof(num = 0) {
    return this.pos + num > this.buf.length;
  }

  /**
   * @param {number} numberOfBytes
   * @param {Endianness} [endianness] 'be' or 'le' (default 'le')
   * @returns {Buffer} the read buffer
   */
  read(numberOfBytes, endianness = "le") {
    if (this.isEof(numberOfBytes)) {
      throw Error(`cannot read ${numberOfBytes}, reached EOF`);
    }
    const res = Buffer.from(this.buf.slice(this.pos, this.pos + numberOfBytes));
    this.pos += numberOfBytes;
    if (endianness === "le") {
      return res.reverse();
    }
    if (endianness === "be") {
      return res;
    }
    throw Error(
      `Endianness not recognized ${endianness}; it should be either 'be' or 'le'`
    );
  }

  /**
   * @typedef {"le" | "be"} Endianness
   */

  /**
   *
   * @param {number} numberOfBytes The number of bytes to read
   * @param {Endianness} [endianness=le] The endianness (default=le)
   * @returns {BN} The read big number
   */
  readBN(numberOfBytes, endianness = "le") {
    return new BN(this.read(numberOfBytes, endianness));
  }

  readVarLenBuf(endianness = "le") {
    const len = this.readVarIntNum();
    return this.read(len, endianness);
  }

  /**
   * Reads a variable integer between 1 and 8 bytes (8 and 64 bits)
   */
  readVarIntBN() {
    const first = this.read(1);
    switch (first[0]) {
      case 0xfd:
        return this.readBN(2);
      case 0xfe:
        return this.readBN(4);
      case 0xff:
        return this.readBN(8);
      default:
        return new BN(first);
    }
  }

  /**
   * Reads a variable integer between 1 and 8 bytes (8 and 64 bits)
   */
  readVarIntNum() {
    const first = this.read(1);
    switch (first) {
      case 0xfd:
        return this.readBN(2).toNumber();
      case 0xfe:
        return this.readBN(4).toNumber();
      case 0xff: {
        // TODO I don't know exactly how to avoid this, if I accept a BN then this.pos and length will be BNs
        // and splice and things like that might not work well
        const n = this.readBN(8).toNumber();
        if (n <= 2 ** 53) {
          return n;
        }
        throw new Error(
          "number too large to retain precision - use readVarintBN"
        );
      }
      default:
        return new BN(first).toNumber();
    }
  }
}

module.exports = BufferReader;
