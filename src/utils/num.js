const BN = require("bn.js");

/**
 * The order of the group
 */
// prettier-ignore
// eslint-disable-next-line no-use-before-define
const N = toBN("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");

const k256 = BN.red("k256");
const orderN = BN.red(N);

/**
 * @param {string|number|BN} num
 * @returns {BN}
 */
function toBN(num) {
  if (num instanceof BN) {
    return num;
  }
  if (num === Infinity) {
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

function toReductionContext(num, reductionContext) {
  if (num === Infinity) {
    return Infinity;
  }
  let result = toBN(num);
  if (!result.red) {
    result = result.toRed(reductionContext);
  }
  return result;
}

/**
 * Returns a big number in the k256 field
 * @param {string|number|BN} num
 */
function toK256(num) {
  return toReductionContext(num, k256);
}

/**
 * Returns a big number in the N order
 * @param {string|number|BN} num
 */
function toOrderN(num) {
  return toReductionContext(num, orderN);
}

module.exports = {
  toBN,
  toK256,
  toOrderN
};
