const shajs = require("sha.js");

/**
 * Performs a double sha256 hash
 * @param {string} msg the message to hash
 */
// prettier-ignore
function sha256(msg) {
  return shajs("sha256").update(shajs("sha256").update(msg).digest()).digest("hex");
}

module.exports = sha256;
