const { expect } = require("chai");
const Signature = require("./Signature");

describe("Signature", () => {
  describe("der", () => {
    it.only("der 1", () => {
      const sig = new Signature(
        "0x37206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c6",
        "0x8ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec"
      );

      expect(sig.der().toString("hex")).to.equal(
        "3045022037206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c60221008ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec"
      );
    });
  });
});
