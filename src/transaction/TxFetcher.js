const axios = require("axios").default;
const { Buffer } = require("buffer");
const BN = require("bn.js");

const cache = {};

function getUrl(testnet = false) {
  return testnet
    ? "http://testnet.programmingbitcoin.com"
    : "http://mainnet.programmingbitcoin.com";
}

/**
 * @returns {Promise<Tx>} returns a transaction
 */
function fetchTx(txId, parseTxFn, testnet = false, fresh = false) {
  if (fresh || !Object.prototype.hasOwnProperty.call(cache, txId)) {
    return axios
      .get(`${getUrl(testnet)}/tx/${txId}.hex`)
      .catch(error => {
        throw Error(`could not fetch tx ${txId}: ${error}`);
      })
      .then(response => {
        const hexStr = response.data.trim();
        let raw = Buffer.from(hexStr, "hex");
        // I cannot just use `Tx.parse(txHex);` to avoid circular dependency
        let tx;
        if (raw[4] === 0x00) {
          raw = Buffer.concat([raw.slice(0, 4), raw.slice(6)]);
          tx = parseTxFn(raw);
          tx.locktime = raw.slice(-4); // in little endian
        } else {
          tx = parseTxFn(raw);
        }
        if (tx.id() !== txId) {
          throw Error(`not the same id: ${txId} vs ${tx.id()}`);
        }
        cache[txId] = tx;
        return cache[txId];
      })
      .catch(error => {
        throw Error(`could not parse tx ${txId}: ${error}`);
      });
  }
  return Promise.resolve(cache[txId]);
}

module.exports = { fetchTx };
