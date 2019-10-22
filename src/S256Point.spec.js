const { expect } = require("chai");
const { G, N } = require("./S256Point");

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
});
