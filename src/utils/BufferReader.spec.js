const chai = require("chai");
const BN = require("bn.js");
const bnChai = require("bn-chai");

chai.use(bnChai(BN));
const { expect } = chai;

const BufferReader = require("./BufferReader");

describe("BufferReader", () => {
  describe("read", () => {
    it("to le int", () => {
      const br = new BufferReader("01000000");
      expect(br.readBN(4)).to.eq.BN(1);
    });

    it("varInt", () => {
      const br = new BufferReader("01");
      expect(br.readVarIntBN()).to.eq.BN(1);
    });
  });
});
