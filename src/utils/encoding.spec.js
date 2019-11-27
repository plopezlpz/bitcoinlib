const { expect } = require("chai");
const { Buffer } = require("buffer");
const { base58, base58Checksum, decodeBase58 } = require("./encoding");

describe("encoding", () => {
  it("base58", () => {
    const bytes = Buffer.from(
      "7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d",
      "hex"
    );
    expect(base58(bytes)).to.equal(
      "9MA8fRQrT4u8Zj8ZRd6MAiiyaxb2Y1CMpvVkHQu5hVM6"
    );
  });

  it("base58, with prefix", () => {
    const bytes = Buffer.from(
      "003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187",
      "hex"
    );
    expect(base58(bytes)).to.equal("16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS");
  });

  it("base58Checksum", () => {
    const bytes = Buffer.from(
      "7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d",
      "hex"
    );
    // prettier-ignore
    expect(base58Checksum(bytes)).to.equal("wdA2ffYs5cudrdkhFm5Ym94AuLvavacapuDBL2CAcvqYPkcvi");
  });
});
