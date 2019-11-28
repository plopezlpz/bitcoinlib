const { Buffer } = require("buffer");
const BN = require("bn.js");
const { sha256 } = require("./utils/hash");
const PrivateKey = require("./crypto/PrivateKey");
const { Tx, TxIn } = require("./transaction/Tx");
const TxOut = require("./transaction/TxOut");
const { decodeBase58Address } = require("./utils/encoding");
const Script = require("./script/Script");

const secret = sha256("I feel Like Pablo");
const privKey = new PrivateKey(`0x${secret}`);
const myAddressFrom = privKey.point.address(true, true);

// mvv9hfgaQzySssn4R4AHSU8k5AGiCvUZe3
console.log(`my address is: ${myAddressFrom}`);
const target = "mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB";

// I have 0.03158023 BTC
// Build the TX
const prevTx =
  "e0d3241855092e72aa419ee2d2d93b0c3a63bff8413c6ff0348b937560558d9a";
const prevIndex = new BN(0);

const txIn = new TxIn(Buffer.from(prevTx, "hex"), prevIndex);
const changeH160 = decodeBase58Address(myAddressFrom);
const changeScript = Script.p2pkhScript(changeH160);
const changeOut = new TxOut(new BN("3050023"), changeScript);

const targetH160 = decodeBase58Address(target);
const targetScript = Script.p2pkhScript(targetH160);
const targetOut = new TxOut(new BN("100000"), targetScript);

const tx = new Tx(
  new BN(1),
  [txIn],
  [changeOut, targetOut],
  Buffer.from([0, 0, 0, 0]),
  true
);
tx.signInput(0, privKey)
  .then(res => console.log(res))
  .catch(err => console.log(err));
