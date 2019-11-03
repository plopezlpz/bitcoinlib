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
    return axios
      .get(url)
      .catch(error => console.log(error))
      .then(response => {
        const txHex = Buffer.from(response.data, "hex");
        // const tx = Tx.parse(txHex); // TODO no idea why this is undefined
        cache[txId] = txHex;
        return txHex;
      });
  }
  return Promise.resolve(cache[txId]);
}

module.exports = { fetchTx };
