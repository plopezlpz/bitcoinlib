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

/**
 * The 20-byte be address hash (in hash160)
 *
 * @param {string} addr the address in base58 format
 */
function decodeBase58Address(addr) {
  let num = N0;
  for (let i = 0; i < addr.length; i += 1) {
    const ch = addr.charAt(i);
    num = num.mul(N58);
    num = num.add(new BN(BASE58_ALPHABET.indexOf(ch)));
  }
  // 25 this is specific to address decoding
  const combined = num.toArrayLike(Buffer, "be", 25);
  const checksum = combined.slice(-4);

  if (sha256(combined.slice(0, -4)).slice(0, 8) !== checksum.toString("hex")) {
    throw Error("bad address checksum");
  }
  // first byte is the network prefix
  return combined.slice(1, -4);
}

function base58Checksum(bytes) {
  return base58(
    Buffer.concat([bytes, Buffer.from(sha256(bytes), "hex").slice(0, 4)])
  );
}

module.exports = { base58, base58Checksum, decodeBase58Address };
