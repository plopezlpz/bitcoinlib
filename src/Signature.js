class Signature {
  constructor(r, s) {
    this.r = r;
    this.s = s;
  }

  toString() {
    return `Signature(${this.r}, ${this.s})`;
  }
}

module.exports = Signature;
