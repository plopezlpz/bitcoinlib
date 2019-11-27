const chai = require("chai");
const BN = require("bn.js");
const bnChai = require("bn-chai");

chai.use(bnChai(BN));
const { expect } = chai;
const { fetchTx } = require("./txFetcher");
const { Tx } = require("./Tx");

describe.skip("txFetcher", () => {
  it("fetches a tx", done => {
    fetchTx(
      "6359f0868171b1d194cbee1af2f16ea598ae8fad666d9b012c8ed2b79a236ec4",
      Tx.parse
    )
      .then(tx => {
        expect(tx.version).to.eq.BN(1);
        done();
      })
      .catch(error => {
        done(error);
      });
  });
});
