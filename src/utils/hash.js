const hash = require("hash.js");

// // TODO this doesn't work properly
// function hash256(bytes, enc) {
//   const hexStr = bytes.toString("hex");
//   return hash
//     .sha256()
//     .update(
//       hash
//         .sha256()
//         .update(hexStr)
//         .digest()
//     )
//     .digest(enc);
// }

/**
 * Performs a double sha256 hash
 * @param {string} msg the message to hash
 * @returns {string} the hashed message in hex
 */
// prettier-ignore
function sha256(msg) {
  return hash.sha256().update(hash.sha256().update(msg).digest()).digest("hex");
}

function hash160(msg) {
  return hash
    .ripemd160()
    .update(
      hash
        .sha256()
        .update(msg)
        .digest()
    )
    .digest("hex");
}

module.exports = { sha256, hash160 };
