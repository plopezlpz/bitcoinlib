const axios = require("axios").default;
const { Buffer } = require("buffer");
// const Tx = require("./Tx");

const cache = {};

function getUrl(testnet = false) {
  return testnet
    ? "https://testnet.blockchain.info"
    : "https://blockchain.info";
}

function fetchTx(txId, testnet = false, fresh = false) {
  if (fresh || !Object.prototype.hasOwnProperty.call(cache, txId)) {
    const url = `${getUrl(testnet)}/tx/${txId}?format=hex`;
    return axios.get(url).then(response => {
      const txHex = Buffer.from(response.data, "hex");
      cache[txId] = txHex; // Tx.parse(txHex);
      return cache[txId];
    });
  }
  return Promise.resolve(cache[txId]);
}

module.exports = { fetchTx };
