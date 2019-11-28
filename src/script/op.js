const Signature = require("../crypto/Signature");
const { Point } = require("../crypto/Point");
const { hash160 } = require("../utils/hash");

// TODO these are the ops I need to do in order to evaluate
function opDup(stack) {
  if (stack.length < 1) {
    return false;
  }
  stack.push(stack.slice(-1)[0]);
  return true;
}

function opHash160(stack) {
  if (stack.length < 1) {
    return false;
  }
  const el = stack.pop();
  stack.push(Buffer.from(hash160(el), "hex"));
  return true;
}

/**
 * @param {Buffer[]} stack
 */
function opEqual(stack) {
  if (stack.length < 2) {
    return false;
  }
  const el1 = stack.pop();
  const el2 = stack.pop();
  if (el1 === el2 || el1.equals(el2)) {
    stack.push(0x01);
  } else {
    stack.push(0x00);
  }
  return true;
}

function opVerify(stack) {
  if (stack.length < 1) {
    return false;
  }
  const el = stack.pop();
  if (el === 0x00) {
    return false;
  }
  return true;
}

function opEqualverify(stack) {
  return opEqual(stack) && opVerify(stack);
}

/**
 * @param {number[] | Buffer[]} stack
 * @param {string} z
 */
function opChecksig(stack, z) {
  if (stack.length < 2) {
    return false;
  }
  const secPubKey = stack.pop();
  // removing the hashtype
  const derSig = stack.pop();
  const der = derSig.slice(0, -1);

  const pubKey = Point.parse(secPubKey);
  const sig = Signature.parse(der);
  if (pubKey.verify(z, sig)) {
    stack.push(0x01);
  } else {
    stack.push(0x00);
  }
  return true;
}

const OP_CODE_FUNCTIONS = {
  // 0: op_0,
  // 79: op_1negate,
  // 81: op_1,
  // 82: op_2,
  // 83: op_3,
  // 84: op_4,
  // 85: op_5,
  // 86: op_6,
  // 87: op_7,
  // 88: op_8,
  // 89: op_9,
  // 90: op_10,
  // 91: op_11,
  // 92: op_12,
  // 93: op_13,
  // 94: op_14,
  // 95: op_15,
  // 96: op_16,
  // 97: op_nop,
  // 99: op_if,
  // 100: op_notif,
  105: { op: opVerify, name: "OP_VERIFY" },
  // 106: op_return,
  // 107: op_toaltstack,
  // 108: op_fromaltstack,
  // 109: op_2drop,
  // 110: op_2dup,
  // 111: op_3dup,
  // 112: op_2over,
  // 113: op_2rot,
  // 114: op_2swap,
  // 115: op_ifdup,
  // 116: op_depth,
  // 117: op_drop,
  118: { op: opDup, name: "OP_DUP" },
  // 119: op_nip,
  // 120: op_over,
  // 121: op_pick,
  // 122: op_roll,
  // 123: op_rot,
  // 124: op_swap,
  // 125: op_tuck,
  // 130: op_size,
  135: { op: opEqual, name: "OP_EQUAL" },
  136: { op: opEqualverify, name: "OP_EQUALVERIFY" },
  // 139: op_1add,
  // 140: op_1sub,
  // 143: op_negate,
  // 144: op_abs,
  // 145: op_not,
  // 146: op_0notequal,
  // 147: op_add,
  // 148: op_sub,
  // 149: op_mul,
  // 154: op_booland,
  // 155: op_boolor,
  // 156: op_numequal,
  // 157: op_numequalverify,
  // 158: op_numnotequal,
  // 159: op_lessthan,
  // 160: op_greaterthan,
  // 161: op_lessthanorequal,
  // 162: op_greaterthanorequal,
  // 163: op_min,
  // 164: op_max,
  // 165: op_within,
  // 166: op_ripemd160,
  // 167: op_sha1,
  // 168: op_sha256,
  169: { op: opHash160, name: "OP_HASH160" },
  // 170: op_hash256,
  172: { op: opChecksig, name: "OP_CHECKSIG" }
  // 173: op_checksigverify,
  // 174: op_checkmultisig,
  // 175: op_checkmultisigverify,
  // 176: op_nop,
  // 177: op_checklocktimeverify,
  // 178: op_checksequenceverify,
  // 179: op_nop,
  // 180: op_nop,
  // 181: op_nop,
  // 182: op_nop,
  // 183: op_nop,
  // 184: op_nop,
  // 185: op_nop
};

/**
 * @typedef {Object} Op
 * @property {function} op The function
 * @property {string} name The name of the operation
 */
/**
 * @param {number} code The op code number
 * @returns {Op} The operation
 */
function getOp(code) {
  return OP_CODE_FUNCTIONS[code];
}

module.exports = { getOp };
