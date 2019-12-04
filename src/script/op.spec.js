const chai = require("chai");
const BN = require("bn.js");
const bnChai = require("bn-chai");
const { Buffer } = require("buffer");
const { getOp } = require("./op");

chai.use(bnChai(BN));
const { expect } = chai;

describe("op", () => {
  it("op_checkmultisig", () => {
    const z =
      "0xe71bfa115715d6fd33796948126f40a8cdd39f187e4afb03896795189fe1423c";
    const sig1 = Buffer.from(
      "3045022100dc92655fe37036f47756db8102e0d7d5e28b3beb83a8fef4f5dc0559bddfb94e02205a36d4e4e6c7fcd16658c50783e00c341609977aed3ad00937bf4ee942a8993701",
      "hex"
    );
    const sig2 = Buffer.from(
      "3045022100da6bee3c93766232079a01639d07fa869598749729ae323eab8eef53577d611b02207bef15429dcadce2121ea07f233115c6f09034c0be68db99980b9a6c5e75402201",
      "hex"
    );
    const sec1 = Buffer.from(
      "022626e955ea6ea6d98850c994f9107b036b1334f18ca8830bfff1295d21cfdb70",
      "hex"
    );
    const sec2 = Buffer.from(
      "03b287eaf122eea69030a0e9feed096bed8045c8b98bec453e1ffac7fbdbd4bb71",
      "hex"
    );
    const stack = [0x00, sig1, sig2, 0x02, sec1, sec2, 0x02];
    const result = getOp(174).op(stack, z);
    expect(result).to.be.true;
    expect(stack[0]).to.be.equals(0x01);
  });
});
