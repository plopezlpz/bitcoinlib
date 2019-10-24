const chai = require("chai");
const BN = require("bn.js");
const bnChai = require("bn-chai");
const { Point } = require("./Point");
const Signature = require("../Signature");

const { expect } = chai;
chai.use(bnChai(BN));

describe("Point in s256", () => {
  const G = new Point(
    "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
  );
  // prettier-ignore
  const N = new BN("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", "hex");

  it("constructor", () => {
    expect(
      () =>
        new Point(
          "0x04519fac3d910ca7e7138f7013706f619fa8f033e6ec6e09370ea38cee6a7574",
          "0x82b51eab8c27c66e26c858a079bcdf4f1ada34cec420cafc7eac1a42216fb6c4"
        )
    ).not.to.throw();
  });

  it("generator point is in the curve", () => {
    const other = new Point(
      "0x04519fac3d910ca7e7138f7013706f619fa8f033e6ec6e09370ea38cee6a7574",
      "0x82b51eab8c27c66e26c858a079bcdf4f1ada34cec420cafc7eac1a42216fb6c4"
    );
    G.add(other);
  });

  it("multiply by 2", () => {
    const result = G.sMul(2);
    expect(result.x.toString(10)).to.be.equal(
      "89565891926547004231252920425935692360644145829622209833684329913297188986597"
    );
    expect(result.y.toString(10)).to.be.equal(
      "12158399299693830322967808612713398636155367887041628176798871954788371653930"
    );
  });

  it("multiply by 10", () => {
    const result = G.sMul(10);
    expect(result.x.toString(10)).to.be.equal(
      "72488970228380509287422715226575535698893157273063074627791787432852706183111"
    );
    expect(result.y.toString(10)).to.be.equal(
      "62070622898698443831883535403436258712770888294397026493185421712108624767191"
    );
  });

  it("multiply by n should render Infinite", () => {
    const result = G.sMul(N);

    expect(result.x).to.be.equal(Infinity);
    expect(result.y).to.be.equal(Infinity);
  });

  it("verify", () => {
    const point = new Point(
      "0x04519fac3d910ca7e7138f7013706f619fa8f033e6ec6e09370ea38cee6a7574",
      "0x82b51eab8c27c66e26c858a079bcdf4f1ada34cec420cafc7eac1a42216fb6c4"
    );

    const sig = new Signature(
      "0x37206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c6",
      "0x8ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec"
    );

    const result = point.verify(
      "0xbc62d4b80d9e36da29c16c5d4d9f11731f36052c72401a76c23c0fb5a9b74423",
      sig
    );

    expect(result).to.be.true;
  });
});
