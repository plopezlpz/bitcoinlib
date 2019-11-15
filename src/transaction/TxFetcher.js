const axios = require("axios").default;
const { Buffer } = require("buffer");

const cache = {};

function getUrl(testnet = false) {
  return testnet
    ? "https://testnet.blockchain.info"
    : "https://blockchain.info";
}

/**
 * @returns {Promise<Tx>} returns a transaction
 */
function fetchTx(txId, parseTxFn, testnet = false, fresh = false) {
  if (fresh || !Object.prototype.hasOwnProperty.call(cache, txId)) {
    return axios
      .get(`${getUrl(testnet)}/tx/${txId}?format=hex`)
      .then(response => {
        const txHex = Buffer.from(response.data, "hex");
        // I cannot just use `Tx.parse(txHex);` to avoid circular dependency
        cache[txId] = parseTxFn(txHex);
        return cache[txId];
      })
      .catch(error => {
        throw Error(`could not fetch tx ${txId}: ${error}`);
      });
  }
  return Promise.resolve(cache[txId]);
}

module.exports = { fetchTx };
