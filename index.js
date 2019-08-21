const crypto = require('crypto');
const sha1 = require("sha1");

// 提供提取消息格式中的密文及生成回复消息格式的接口
class XMLParse {
  /**
   *
   * @param {String} msg_encrypt
   * @param {String} msg_signaturet
   * @param {String} timestamp
   * @param {String} nonce
   */
  generate(msg_encrypt, msg_signaturet, timestamp, nonce) {
    return `<xml>
    <Encrypt><![CDATA[${msg_encrypt}]]></Encrypt>
    <MsgSignature><![CDATA[${msg_signaturet}]]></MsgSignature>
    <TimeStamp>${timestamp}</TimeStamp>
    <Nonce><![CDATA[${nonce}]]></Nonce>
    </xml>`;
  }
}
// 提供基于PKCS7算法的加解密接口
class PKCS7Encoder {
  constructor() {
    this.block_size = 32;
  }
  /**
   *
   * @param {Number} text_length
   */
  encode(text_length) {
    // 计算需要填充的位数
    let amount_to_pad = this.block_size - (text_length % this.block_size);
    if (amount_to_pad === 0) {
      amount_to_pad = this.block_size;
    }

    // 获得补位所用的字符
    const pad = String.fromCharCode(amount_to_pad);
    const s = [];
    // console.log('pad:', amount_to_pad, pad);
    for (let i = 0; i < amount_to_pad; i++) s.push(pad);
    return s.join('');
  }
}
/**
 * 提供接收和推送给公众平台消息的加解密接口
 */
class Prpcrypt {
  constructor(k) {
    this.key = Buffer.from(`${k}=`, "base64");// .toString('binary');
    this.mode = 'aes-256-cbc';
    this.iv = this.key.toString('hex').slice(0, 16);
  }
  /**
   *
   * @param {String} text xml
   * @param {String} appid
   */
  encrypt(text, appid) {
    const btext = Buffer.from(text);
    const pad = this.enclen(btext.length);
    const pack = new PKCS7Encoder().encode(20 + btext.length + appid.length);
    const random = this.getRandomStr();
    const content = random + pad + btext.toString('binary') + appid + pack;
    const cipher = crypto.createCipheriv(this.mode, this.key, this.iv);
    cipher.setAutoPadding(false);
    const crypted = cipher.update(content, 'binary', 'base64') + cipher.final('base64');
    return crypted;
  }
  /**
  *
  * @param {String} encrypted
  */
  decrypt(encrypted) {
    const decipher = crypto.Decipheriv(this.mode, this.key, this.iv);
    decipher.setAutoPadding(false);
    let plain_text = decipher.update(encrypted, 'base64');
    plain_text = Buffer.concat([plain_text, decipher.final()]);
    let pad = plain_text[plain_text.length - 1];
    if (pad < 1 || pad > 32) pad = 0;
    plain_text = plain_text.slice(20, -pad).toString('utf8').replace(/<\/xml>.*/, '</xml>');
    return plain_text;
  }
  /**
 *
 * @param {Number} len
 */
  enclen(len) {
    const buf = new Buffer(4);
    buf.writeUInt32BE(len);
    return buf.toString('binary');
  }

  getRandomStr() {
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    let re = '';
    for (let i = 0; i < 16; i++) {
      re += pool.charAt(Math.random() * pool.length);
    }
    return re;
  }
}

class WXbizMsgCrypt {
  constructor(token, key, appid) {
    this.token = token;
    this.key = key;
    this.appid = appid;
  }
  /**
 *
 * @param {String} token
 * @param {String} timestamp
 * @param {String} nonce
 * @param {String} encrypt
 */
  mysha1(token, timestamp, nonce, encrypt) {
    const param = [token, timestamp, nonce, encrypt];
    return sha1(param.sort().join(""));
  }

  /**
   * 加密消息
   * @param {String} text
   * @param {String} timestamp
   * @param {String} nonce
   */
  EncryptMsg(text, timestamp, nonce) {
    const prp = new Prpcrypt(this.key);
    const encrypted = prp.encrypt(text, this.appid);
    const msg_signature = this.mysha1(this.token, timestamp, nonce, encrypted);
    const xmlParse = new XMLParse();
    return xmlParse.generate(encrypted, msg_signature, timestamp, nonce);
  }

  /**
   * 解密消息
   * @param {String} encrypted
   * @param {String} msg_signature
   * @param {String} timestamp
   * @param {String} nonce
   */
  DecryptMsg(encrypted, msg_signature, timestamp, nonce) {
    const signature = this.mysha1(this.token, timestamp, nonce, encrypted);
    if (msg_signature !== signature) {
      throw new Error("msg_signature错误");
    }
    const prp = new Prpcrypt(this.key);
    return prp.decrypt(encrypted, this.appid);
  }

  /**
   * 解析微信xml
   * @param {String} xml
   */
  WechatXML2JSON(xml) {
    if (!xml || typeof xml !== 'string') return {};
    const re = {};
    xml = xml.replace(/^<xml>|<\/xml>$/g, '');
    const ms = xml.match(/<([a-z0-9]+)>([\s\S]*?)<\/\1>/ig);
    if (ms && ms.length > 0) {
      ms.forEach(t => {
        const m = t.match(/<([a-z0-9]+)>([\s\S]*?)<\/\1>/i);
        const tagName = m[1];
        let cdata = m[2] || '';
        cdata = cdata.replace(/^\s*<\!\[CDATA\[\s*|\s*\]\]>\s*$/g, '');
        re[tagName] = cdata;
      });
    }
    return re;
  }
  JSON2WechatXML(FromUserName, ToUserName, CreateTime, Content) {
    return `
    <xml>
   <ToUserName><![CDATA[${ToUserName}]]></ToUserName>
   <FromUserName><![CDATA[${FromUserName}]]></FromUserName>
   <CreateTime>${CreateTime}</CreateTime>
   <MsgType><![CDATA[text]]></MsgType>
   <Content><![CDATA[${Content}]]></Content>
   </xml>
 `;
  }
}

module.exports = WXbizMsgCrypt;
