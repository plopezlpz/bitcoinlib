const BN = require("bn.js");
const { Buffer } = require("buffer");
const { sha256 } = require("./hash");

// prettier-ignore
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const N58 = new BN(58);
const N0 = new BN(0);

function base58(bytes) {
  let prefix = "";
  let result = "";
  bytes.some(b => {
    if (b === 0x00) {
      prefix += "1";
      return false;
    }
    return true;
  });
  let div = new BN(bytes);
  while (div.gt(N0)) {
    const res = div.divmod(N58);
    div = res.div;
    // num = num.div(new BN(58));
    result = BASE58_ALPHABET[res.mod.toNumber()] + result;
  }
  return prefix + result;
}

function base58Checksum(bytes) {
  return base58(
    Buffer.concat([bytes, Buffer.from(sha256(bytes), "hex").slice(0, 4)])
  );
}

module.exports = { base58, base58Checksum };
