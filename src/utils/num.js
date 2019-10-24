const BN = require("bn.js");

/**
 * @param {string|number|BN} num
 * @returns {BN}
 */
function toBN(num) {
  if (num instanceof BN) {
    return num;
  }
  if (typeof num === "number" || num instanceof Number) {
    return new BN(num);
  }
  if (typeof num === "string" || num instanceof String) {
    if (num.startsWith("0x")) {
      return new BN(num.substring(2), "hex");
    }
    if (num.startsWith("0o")) {
      return new BN(num.substring(2), 8);
    }
    if (num.startsWith("0b")) {
      return new BN(num.substring(2), 2);
    }
  }
  throw Error(`Unrecognized number format for: ${num}`);
}

module.exports = toBN;
