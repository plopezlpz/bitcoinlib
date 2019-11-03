const { fetchTx } = require("./txFetcher");
const Tx = require("./Tx");

describe("txFetcher", () => {
  it.only("fetches a tx", done => {
    fetchTx(
      "6359f0868171b1d194cbee1af2f16ea598ae8fad666d9b012c8ed2b79a236ec4"
    ).then(txHex => {
      const tx = Tx.parse(txHex);
      console.log(tx.version.toString());
      done();
    });
  });
});
