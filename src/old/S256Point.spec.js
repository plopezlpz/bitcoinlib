const { expect } = require("chai");
const { G, N, S256Point } = require("./S256Point");
const Signature = require("../crypto/Signature");

describe("S256Point", () => {
  it("scalar multiplication", () => {
    const result = G.stimes(N);
    expect(result.x).to.be.equal(Infinity);
  });

  // prettier-ignore
  it("multiply by 2", () => {
    const result = G.stimes(2);
    expect(result.x.num.toString(10)).to.be.equal("89565891926547004231252920425935692360644145829622209833684329913297188986597");
    expect(result.y.num.toString(10)).to.be.equal("12158399299693830322967808612713398636155367887041628176798871954788371653930");
  });

  it("verify", () => {
    const point = new S256Point(
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
