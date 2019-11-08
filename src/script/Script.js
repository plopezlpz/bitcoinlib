// eslint-disable-next-line no-unused-vars
const BufferReader = require("../utils/BufferReader");
const BufferWriter = require("../utils/BufferWriter");

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
        cmds.push(br.read(currentByte));
        count += currentByte;
      } else if (currentByte === 76) {
        const dataLength = br.read(1).readUInt8();
        cmds.push(br.read(dataLength));
        count += dataLength + 1;
      } else if (currentByte === 77) {
        const dataLength = br.read(2).readUInt8();
        cmds.push(br.read(dataLength));
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

  rawSerialize() {
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
        bw.write(cmd.reverse());
      }
    }
    return bw.toBufWithVarIntSize();
  }

  serialize() {
    return this.rawSerialize();
    // TODO I don't know why this should not be added here
    // return Buffer.concat([BufferReader.toVarIntNum(serial.length), serial]);
  }
}

module.exports = Script;
