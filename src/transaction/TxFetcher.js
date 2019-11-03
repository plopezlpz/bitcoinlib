const request = require("request");
const { Buffer } = require("buffer");
const Tx = require("./Tx");

const cache = {};

function getUrl(testnet = false) {
  return testnet
    ? "https://testnet.blockchain.info"
    : "https://blockchain.info";
}

function fetch(txId, testnet = false, fresh = false) {
  if (fresh || !Object.prototype.hasOwnProperty.call(cache, txId)) {
    const url = `${getUrl(testnet)}/tx/${txId}?format=hex`;

    request(url, (error, response, body) => {
      if (error) {
        console.log(error);
        return;
      }
      const raw = Buffer.from(body, "hex");
      const tx = Tx.parse(raw);
      cache[txId] = tx;
    });
  }
}
