const BigNumber = require("bignumber.js");
const { stub } = require("sinon");
const { expect } = require("chai");
const sha = require("./utils/sha");
const PrivateKey = require("./PrivateKey");

describe("PrivateKey", () => {
  it.only("signs tx (brainwallet style)", () => {
    /** @type {BigNumber.BigNumber} */
    const e = BigNumber(`0x${sha("my secret")}`);
    /** @type {BigNumber.BigNumber} */
    const z = BigNumber(`0x${sha("my message")}`);
    const priv = new PrivateKey(e);
    stub(priv, "deterministicK").callsFake(() => BigNumber(1234567890));

    const sig = priv.sign(z);

    // prettier-ignore
    expect(sig.r.toString(16)).to.be.equal("2b698a0f0a4041b77e63488ad48c23e8e8838dd1fb7520408b121697b782ef22");
    // prettier-ignore
    expect(sig.s.toString(16)).to.be.equal("bb14e602ef9e3f872e25fad328466b34e6734b7a0fcd58b1eb635447ffae8cb9");
  });
});
