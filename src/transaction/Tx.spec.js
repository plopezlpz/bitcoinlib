const chai = require("chai");
const BN = require("bn.js");
const bnChai = require("bn-chai");
const { Buffer } = require("buffer");
const Tx = require("./Tx");
const { fetchTx } = require("./txFetcher");

chai.use(bnChai(BN));
const { expect } = chai;

describe("Tx", () => {
  const txHex =
    "0100000001c33ebff2a709f13d9f9a7569ab16a32786af7d7e2de09265e41c61d078294ecf010000008a4730440220032d30df5ee6f57fa46cddb5eb8d0d9fe8de6b342d27942ae90a3231e0ba333e02203deee8060fdc70230a7f5b4ad7d7bc3e628cbe219a886b84269eaeb81e26b4fe014104ae31c31bf91278d99b8377a35bbce5b27d9fff15456839e919453fc7b3f721f0ba403ff96c9deeb680e5fd341c0fc3a7b90da4631ee39560639db462e9cb850fffffffff0240420f00000000001976a914b0dcbf97eabf4404e31d952477ce822dadbe7e1088acc060d211000000001976a9146b1281eec25ab4e1e0793ff4e08ab1abb3409cd988ac00000000";
  describe("parse", () => {
    it("parses tx", () => {
      const tx = Tx.parse(Buffer.from(txHex, "hex"));
      expect(tx.version).to.eq.BN(1);
      expect(tx.txIns.length).to.equal(1);
      expect(tx.txOuts.length).to.equal(2);
      expect(tx.txOuts[0].amount).to.eq.BN(1000000);
      expect(tx.txOuts[1].amount).to.eq.BN(299000000);
      expect(tx.locktime).to.eq.BN(0);
    });

    // TODO if I run this twice I get: AssertionError: expected 46127884334530560 to equal 300000000
    it.skip("gets input value from previous tx", done => {
      const tx = Tx.parse(Buffer.from(txHex, "hex"));
      expect(tx.version).to.eq.BN(1);
      expect(tx.txIns.length).to.equal(1);
      expect(tx.txOuts.length).to.equal(2);
      expect(tx.txOuts[0].amount).to.eq.BN(1000000);
      expect(tx.txOuts[1].amount).to.eq.BN(299000000);
      expect(tx.locktime).to.eq.BN(0);

      tx.txIns[0].value(Tx.parse).then(() => {
        expect(tx.txIns[0].amount).to.eq.BN(300000000);
        done();
      });
    });

    it.skip("gets input value from previous tx", done => {
      const tx = Tx.parse(Buffer.from(txHex, "hex"));
      tx.fee()
        .then(value => {
          expect(value).to.eq.BN(0);
          done();
        })
        .catch(error => done(error));
    });
  });

  describe("serialize", () => {
    it("serializes tx", () => {
      const tx = Tx.parse(Buffer.from(txHex, "hex"));
      const result = tx.serialize();
      expect(result.toString("hex")).to.equal(txHex);
    });

    it("sigHash", done => {
      const expected =
        "27e0c5994dec7824e56dec6b2fcb342eb7cdb0d0957c2fce9882f715e85d81a6";
      fetchTx(
        "452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03",
        Tx.parse
      )
        .then(tx => tx.sigHash(0))
        .then(res => {
          expect(res.toString("hex")).to.equal(expected);
          done();
        })
        .catch(error => done(error));
    });

    it.only("test_verify_p2pkh", done => {
      const tx1 =
        "1c87380b22683d970bf226200d9a5500c0d9cf86089a8e2840c081095e4b2c23";
      fetchTx(tx1, Tx.parse)
        .then(tx => tx.verify())
        .then(res => {
          expect(res).to.be.true;
          done();
        })
        .catch(error => done(error));
    });
  });
});
