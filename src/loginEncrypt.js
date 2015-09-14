import crypto from 'crypto';
import { Ber } from 'asn1';
import { RSA_PKCS1_PADDING } from 'constants';

function linebrk(str, maxLen) {
  let res = '';
  let i = 0;
  while (i + maxLen < str.length) {
    res += str.substring(i, i + maxLen) + '\n';
    i += maxLen;
  }
  return res + str.substring(i, str.length);
}

function getEncChar(value) {
  return String.fromCharCode(value.length) + value;
}

export default function encryptKey(keyString, username, password) {
  const [sessionKey, keyName, nValue, eValue] = keyString.split(',');
  // Parse eValue, nValue
  let keyN = new Buffer(nValue, 'hex');
  let keyE = parseInt(eValue, 16);
  const size = keyN.length + 512;
  // Create PEM encoded RSA public key
  let bodyWriter = new Ber.Writer({ size });
  bodyWriter.startSequence();
  bodyWriter.writeBuffer(keyN, 2);
  bodyWriter.writeInt(keyE);
  bodyWriter.endSequence();
  let key = '-----BEGIN RSA PUBLIC KEY-----\n';
  key += linebrk(bodyWriter.buffer.toString('base64'), 64);
  key += '\n-----END RSA PUBLIC KEY-----\n';
  // Encode credentials using PEM key
  let encryptBuffer = new Buffer(getEncChar(sessionKey) +
    getEncChar(username) + getEncChar(password));
  let encrypted = crypto.publicEncrypt({
    key, padding: RSA_PKCS1_PADDING
  }, encryptBuffer);
  return {
    keyName, key: encrypted.toString('hex')
  };
}
