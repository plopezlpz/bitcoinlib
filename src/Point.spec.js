const { expect } = require("chai");
const BigNumber = require("bignumber.js");
const FieldElement = require("./FieldElement");
const Point = require("./Point");

describe("Point", () => {
  describe("constructor", () => {
    it("test for point in curve or not", () => {
      // # tests the following points whether they are on the curve or not
      // # on curve y^2=x^3-7 over F_223:
      // # (192,105) (17,56) (200,119) (1,193) (42,99)
      const prime = 223;
      const a = new FieldElement(0, prime);
      const b = new FieldElement(7, prime);

      // valid_points = ((192, 105), (17, 56), (1, 193))
      // invalid_points = ((200, 119), (42, 99))
      [[192, 105], [17, 56], [1, 193]].forEach(tuple => {
        const x = new FieldElement(tuple[0], prime);
        const y = new FieldElement(tuple[1], prime);
        expect(() => new Point(x, y, a, b)).not.to.throw();
      });

      [[200, 119], [42, 99]].forEach(tuple => {
        const x = new FieldElement(tuple[0], prime);
        const y = new FieldElement(tuple[1], prime);
        expect(() => new Point(x, y, a, b)).to.throw(/is not in the curve/);
      });
    });
  });

  describe("addition", () => {
    it("tests additions", () => {
      // tests the following additions on curve y^2=x^3-7 over F_223:
      // (192,105) + (17,56)
      // (47,71) + (117,141)
      // (143,98) + (76,66)
      const prime = 223;
      const a = new FieldElement(0, prime);
      const b = new FieldElement(7, prime);

      const additions = [
        // (x1, y1, x2, y2, x3, y3)
        [192, 105, 17, 56, 170, 142],
        [47, 71, 117, 141, 60, 139],
        [143, 98, 76, 66, 47, 71]
      ];

      additions.forEach(points => {
        const x1 = new FieldElement(points[0], prime);
        const y1 = new FieldElement(points[1], prime);
        const p1 = new Point(x1, y1, a, b);

        const x2 = new FieldElement(points[2], prime);
        const y2 = new FieldElement(points[3], prime);
        const p2 = new Point(x2, y2, a, b);

        const x3 = new FieldElement(points[4], prime);
        const y3 = new FieldElement(points[5], prime);
        const p3 = new Point(x3, y3, a, b);
        // check that p1 + p2 == p3
        expect(p1.add(p2).equals(p3)).to.be.true;
      });
    });

    it("smul", () => {
      // # tests the following scalar multiplications
      // # 2*(192,105)
      // # 2*(143,98)
      // # 2*(47,71)
      // # 4*(47,71)
      // # 8*(47,71)
      // # 21*(47,71)
      const prime = 223;
      const a = new FieldElement(0, prime);
      const b = new FieldElement(7, prime);

      const multiplications = [
        // (coefficient, x1, y1, x2, y2)
        [2, 192, 105, 49, 71],
        [2, 143, 98, 64, 168],
        [2, 47, 71, 36, 111],
        [4, 47, 71, 194, 51],
        [8, 47, 71, 116, 55],
        [21, 47, 71, Infinity, Infinity] // <- TODO fix this
      ];

      multiplications.forEach(points => {
        const s = points[0];
        const x1 = new FieldElement(points[1], prime);
        const y1 = new FieldElement(points[2], prime);
        const p1 = new Point(x1, y1, a, b);

        let p2;
        if (points[3] === Infinity) {
          p2 = new Point(Infinity, Infinity, a, b);
        } else {
          const x2 = new FieldElement(points[3], prime);
          const y2 = new FieldElement(points[4], prime);
          p2 = new Point(x2, y2, a, b);
        }
        expect(p1.smul(s).equals(p2)).to.be.true;
      });
    });
  });

  describe("secp256k1", () => {
    // prettier-ignore
    const gx = BigNumber("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798");
    // prettier-ignore
    const gy = BigNumber("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8");
    // prettier-ignore
    const p = BigNumber(2).pow(256).minus(BigNumber(2).pow(32)).minus(977);
    // prettier-ignore
    const n = BigNumber("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");

    const x = new FieldElement(gx, p);
    const y = new FieldElement(gy, p);
    const zero = new FieldElement(0, p);
    const seven = new FieldElement(7, p);

    const G = new Point(x, y, zero, seven);

    it("G (generator point) is in the curve", () => {
      expect(() => new Point(x, y, zero, seven)).not.to.throw();
    });

    // prettier-ignore
    it("multiply by 2", () => {
      const result = G.smul(2);
      expect(result.x.num.toString(10)).to.be.equal("89565891926547004231252920425935692360644145829622209833684329913297188986597");
      expect(result.y.num.toString(10)).to.be.equal("12158399299693830322967808612713398636155367887041628176798871954788371653930");
    })

    // prettier-ignore
    it.only("multiply by 20", () => {
      const result = G.smul(10);
      expect(result.x.num.toString(10)).to.be.equal("72488970228380509287422715226575535698893157273063074627791787432852706183111");
      expect(result.y.num.toString(10)).to.be.equal("62070622898698443831883535403436258712770888294397026493185421712108624767191");
    })
  });
});
