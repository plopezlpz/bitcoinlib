const BN = require("bn.js");
const { stub } = require("sinon");
const { expect } = require("chai");
const { sha256 } = require("../utils/hash");
const PrivateKey = require("./PrivateKey");

describe("PrivateKey", () => {
  it("signs tx (brainwallet style)", () => {
    const e = new BN(sha256("my secret"), "hex");
    const z = new BN(sha256("my message"), "hex");
    const priv = new PrivateKey(e);
    stub(priv, "deterministicK").callsFake(() => new BN(1234567890));

    const sig = priv.sign(z);

    // prettier-ignore
    expect(sig.r.toString(16)).to.be.equal("2b698a0f0a4041b77e63488ad48c23e8e8838dd1fb7520408b121697b782ef22");
    // prettier-ignore
    expect(sig.s.toString(16)).to.be.equal("bb14e602ef9e3f872e25fad328466b34e6734b7a0fcd58b1eb635447ffae8cb9");
  });

  it("deterministicK", () => {
    const e = new BN(sha256("my secret"), "hex");
    const z = new BN(sha256("my message"), "hex");
    const priv = new PrivateKey(e);

    // prettier-ignore
    expect(priv.deterministicK(z).toString(10)).to.equal("113213234669682963325447032715629850130244745741694426314257695186651662957264");
  });

  it("wif", () => {
    const priv = new PrivateKey(5003);
    expect(priv.wif(true, true)).to.equal(
      "cMahea7zqjxrtgAbB7LSGbcQUr1uX1ojuat9jZodMN8rFTv2sfUK"
    );
  });

  it("wif mainnet", () => {
    const priv = new PrivateKey("0x54321deadbeef");
    expect(priv.wif(true, false)).to.equal(
      "KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgiuQJv1h8Ytr2S53a"
    );
  });

  it("wif uncommpressed", () => {
    const priv = new PrivateKey("33715652388894101");
    expect(priv.wif(false, true)).to.equal(
      "91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjpWAxgzczjbCwxic"
    );
  });
});
