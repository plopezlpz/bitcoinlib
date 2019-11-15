/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const BufferReader = require("../utils/BufferReader");
const BufferWriter = require("../utils/BufferWriter");
const { getOp } = require("./op");

class Script {
  constructor(cmds) {
    this.cmds = cmds || [];
  }

  /**
   * @param {BufferReader} br
   */
  static parse(br) {
    const length = br.readVarIntNum();
    const cmds = [];
    let count = 0;
    while (count < length) {
      const current = br.read(1);
      count += 1;
      const currentByte = current.readUInt8();
      if (currentByte >= 1 && currentByte <= 75) {
        // the next n bytes are an element
        cmds.push(br.read(currentByte, "be"));
        count += currentByte;
      } else if (currentByte === 76) {
        const dataLength = br.read(1).readUInt8();
        cmds.push(br.read(dataLength, "be"));
        count += dataLength + 1;
      } else if (currentByte === 77) {
        const dataLength = br.read(2).readUInt8();
        cmds.push(br.read(dataLength, "be"));
        count += dataLength + 2;
      } else {
        const opCode = currentByte;
        cmds.push(opCode);
      }
    }
    if (count !== length) {
      throw Error("parsing script failed");
    }
    return new Script(cmds);
  }

  static combine(s1, s2) {
    return new Script([...s1.cmds, ...s2.cmds]);
  }

  serialize() {
    const bw = new BufferWriter();
    for (let i = 0; i < this.cmds.length; i += 1) {
      const cmd = this.cmds[i];
      if (typeof cmd === "number" && cmd <= 255) {
        // it is an opcode
        bw.writeUInt8(cmd);
      } else {
        const { length } = cmd;
        if (length < 75) {
          bw.writeUInt8(length);
        } else if (length > 75 && length <= 255) {
          bw.writeUInt8(76);
          bw.writeUInt8(length);
        } else if (length > 255 && length <= 520) {
          bw.writeUInt8(77);
          bw.writeUInt16LE(length);
        } else {
          throw Error("too long an cmd");
        }
        // Write in LE
        bw.write(cmd);
      }
    }
    return bw.toBufWithVarIntSize();
  }

  /**
   * @param {string} z The signature hash
   */
  evaluate(z) {
    // TODO should I reverse them? depends on how parse orders the cmds
    const cmds = [...this.cmds].reverse();
    const stack = [];
    const altStack = [];
    while (cmds.length > 0) {
      const cmd = cmds.pop();
      if (typeof cmd === "number") {
        const { op, name } = getOp(cmd);
        if ([99, 100].includes(cmd)) {
          // TODO code the actual operations!!!!
          if (!op(stack, cmds)) {
            console.log(`bad op: ${name}`);
            return false;
          }
        } else if ([107, 108].includes(cmd)) {
          if (!op(stack, altStack)) {
            console.log(`bad op: ${name}`);
            return false;
          }
        } else if ([172, 173, 174, 175].includes(cmd)) {
          if (!op(stack, z)) {
            console.log(`bad op: ${name}`);
            return false;
          }
        } else if (!op(stack)) {
          console.log(`bad op: ${name}`);
          return false;
        }
      } else {
        stack.push(cmd);
      }
    }
    if (stack.length === 0) {
      return false;
    }
    // maybe
    if (stack.pop() !== 0x01) {
      return false;
    }
    return true;
  }
}

module.exports = Script;
