const BigNumber = require("bignumber.js");
const FieldElement = require("./FieldElement");

/**
 * Supports `FieldElement`s not numbers or big numbers
 * Point in curve: `y^2 != x^3 + a * x + b`
 */
class Point {
  constructor(x, y, a, b) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.b = b;

    if (x === Infinity && y === Infinity) {
      return;
    }
    // this.y**2 != this.x**3 + a * x + b:
    // prettier-ignore
    if (!y.pow(2).equals(x.pow(3).add(a.mul(x)).add(b))) {
      throw Error(`(${x.num}, ${y.num}) is not in the curve`);
    }
  }

  equals(other) {
    return (
      (this.x === other.x || this.x.equals(other.x)) &&
      (this.y === other.y || this.y.equals(other.y)) &&
      this.a.equals(other.a) &&
      this.b.equals(other.b)
    );
  }

  add(other) {
    if (!this.a.equals(other.a) || !this.b.equals(other.b)) {
      throw Error(`Points ${this}, ${other} are not on the same curve`);
    }
    // Case 0.0 this is point at infinity, return other
    if (this.x === Infinity) {
      return other;
    }
    // Case 0.1 other is point at infinity, return this
    if (other.x === Infinity) {
      return this;
    }
    // Case 1: self.x == other.x, self.y != other.y
    // Result is point at infinity
    if (this.x.equals(other.x) && !this.y.equals(other.y)) {
      return new Point(Infinity, Infinity, this.a, this.b);
    }

    // Case 2: self.x ≠ other.x
    // Formula (x3,y3)==(x1,y1)+(x2,y2)
    // s=(y2-y1)/(x2-x1)
    // x3=s**2-x1-x2
    // y3=s*(x1-x3)-y1
    // prettier-ignore
    if (!this.x.equals(other.x)) {
      const s = (other.y.sub(this.y)).div(other.x.sub(this.x));
      const x = s.pow(2).sub(this.x).sub(other.x);
      const y = s.mul(this.x.sub(x)).sub(this.y);
      return new Point(x, y, this.a, this.b);
    }

    // Case 4: if we are tangent to the vertical line,
    // we return the point at infinity
    // note instead of figuring out what 0 is for each type
    // we just use 0 * self.x
    const num0 = new FieldElement(0, this.x.prime);
    // prettier-ignore
    if (this.equals(other) && this.y.equals(num0.mul(this.x))) {
      return new Point(Infinity, Infinity, this.a, this.b);
    }

    // Case 3: self == other
    // Formula (x3,y3)=(x1,y1)+(x1,y1)
    // s=(3*x1**2+a)/(2*y1)
    // x3=s**2-2*x1
    // y3=s*(x1-x3)-y1
    // prettier-ignore
    if (this.equals(other)) {
      const num3 = new FieldElement(3, this.x.prime);
      const num2 = new FieldElement(2, this.x.prime);

      const s = (num3.mul(this.x.pow(2)).add(this.a))
                .div(num2.mul(this.y));
      const x = s.pow(2).sub(num2.mul(this.x));
      const y = s.mul(this.x.sub(x)).sub(this.y);
      return new Point(x, y, this.a, this.b);
    }
    throw Error(`could not add ${this} + ${other}`);
  }

  smul(coefficient) {
    // TODO still not good performance 2.5 seconds when multiplying by n
    let coef = BigNumber(coefficient).toString(2); // binary representation
    let current = this;
    let result = new Point(Infinity, Infinity, this.a, this.b);

    while (coef) {
      if (coef.endsWith("1")) {
        result = result.add(current);
      }
      current = current.add(current);
      coef = coef.slice(0, -1);
    }
    return result;
  }

  // prettier-ignore
  toString() {
    if (this.x === Infinity) {
      return `Point(Infinity)_${this.a.num.toString(10)}_${this.b.num.toString(10)}`
    } 
    return `Point(${this.x.num.toString(10)}, ${this.y.num.toString(10)})_${this.a.num.toString(10)}_${this.b.num.toString(10)}`;
  }
}

module.exports = Point;
