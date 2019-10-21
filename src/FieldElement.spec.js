const chai = require("chai");
const FieldElement = require("./FieldElement");

chai.use(require("chai-bignumber")());

const { expect } = chai;

describe("FieldElement", () => {
  const prime = 13;

  describe("constructor", () => {
    it("should error when num not in range", () => {
      expect(() => new FieldElement(12, 11)).to.throw(
        /Num 12 not in field range 0 to 10/
      );
    });
    it("should not error when num in range", () => {
      expect(() => new FieldElement(1, 11)).not.to.throw(
        /Num 12 not in field range 0 to 10/
      );
    });
  });

  describe("add", () => {
    it("should throw exception when the prime is not the same", () => {
      const a = new FieldElement(1, prime);
      const b = new FieldElement(1, 15);

      expect(() => a.add(b)).to.throw(
        /operation not valid for numbers of different fields/
      );
    });

    it("should add when the prime is the same", () => {
      const a = new FieldElement(1, prime);
      const b = new FieldElement(12, prime);
      const sum = a.add(b);

      expect(sum.num).to.be.bignumber.equal(0);
      expect(sum.prime).to.be.bignumber.equal(prime);
    });
  });

  describe("sub", () => {
    it("should throw exception when the prime is not the same", () => {
      const a = new FieldElement(1, prime);
      const b = new FieldElement(1, 15);

      expect(() => a.sub(b)).to.throw(
        /operation not valid for numbers of different fields/
      );
    });

    it("should substract when the prime is the same", () => {
      const a = new FieldElement(0, prime);
      const b = new FieldElement(1, prime);
      const sum = a.sub(b);

      expect(sum.num).to.be.bignumber.equal(12);
      expect(sum.prime).to.be.bignumber.equal(prime);
    });
  });

  describe("equals", () => {
    it("should be the same", () => {
      const a = new FieldElement(1, prime);
      const b = new FieldElement(1, prime);

      expect(a.equals(b)).to.be.true;
    });
    it("should not be the same when num is different", () => {
      const a = new FieldElement(1, prime);
      const b = new FieldElement(2, prime);

      expect(a.equals(b)).to.be.false;
    });
    it("should not be the same when prime is different", () => {
      const a = new FieldElement(1, 13);
      const b = new FieldElement(2, 15);

      expect(a.equals(b)).to.be.false;
    });
  });

  describe("mul", () => {
    it("should multiply", () => {
      const a = new FieldElement(24, 31);
      const b = new FieldElement(19, 31);

      const result = a.mul(b);
      expect(result.num).to.be.bignumber.equal(22);
      expect(result.prime).to.be.bignumber.equal(31);
    });
  });

  describe("pow", () => {
    it("should raise to exp", () => {
      const a = new FieldElement(17, 31);

      const result = a.pow(3);
      expect(result.num).to.be.bignumber.equal(15);
      expect(result.prime).to.be.bignumber.equal(31);
    });

    it("negative exp", () => {
      const a = new FieldElement(7, 13);

      const result = a.pow(-3);
      expect(result.num).to.be.bignumber.equal(8);
      expect(result.prime).to.be.bignumber.equal(13);
    });

    it("slightly bigger num", () => {
      const a = new FieldElement(48, 223);
      const result = a.pow(221);
      expect(result.num).to.bignumber.equal(79);
    });
  });

  describe("div", () => {
    it("divides", () => {
      // a = FieldElement(3, 31)
      // b = FieldElement(24, 31)
      // self.assertEqual(a / b, FieldElement(4, 31))
      const a = new FieldElement(3, 31);
      const b = new FieldElement(24, 31);
      const result = a.div(b);
      expect(result.num).to.be.bignumber.equal(4);
    });
  });
});
