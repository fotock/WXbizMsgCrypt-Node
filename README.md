# WXbizMsgCrypt-Node
WXbizMsgCrypt-Node

## 修复

- 修复了 spadesk1991/WXbizMsgCrypt 中的解密消息体里带有appId 的问题
- 更新了方法命名规范

## Installation

## Usage
```bash
$ npm i wxbizmsgcrypt-node --save
```


## Example

```js
const WXBizMsgCrypt = require("wxbizmsgcrypt-node");

// 测试加密接口
const encodingAESKey = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG"
const toXml = ` <xml><ToUserName><![CDATA[oia2TjjewbmiOUlr6X-1crbLOvLw]]></ToUserName><FromUserName><![CDATA[gh_7f083739789a]]></FromUserName><CreateTime>1407743423</CreateTime><MsgType>  <![CDATA[video]]></MsgType><Video><MediaId><![CDATA[eYJ1MbwPRJtOvIEabaxHs7TX2D-HV71s79GUxqdUkjm6Gs2Ed1KF3ulAOA9H1xG0]]></MediaId><Title><![CDATA[testCallBackReplyVideo]]></Title><Descript  ion><![CDATA[testCallBackReplyVideo]]></Description></Video></xml>`
const token = "spamtest"
const nonce = "1320562132"
const appid = "wx2c2769f8efd9abc2"
const encryptTest = new WXBizMsgCrypt(token,encodingAESKey,appid);
try {
    const encryptedXml = encryp_test.encryptMsg(toXml,nonce);
    console.log(encryptedXml);
} catch (e) {
    console.log(e);
}


// 测试解密接口

const timestamp = "1409735669"
const msg_signature  = "5d197aaffba7e9b25a30732f161a50dee96bd5fa"

const from_xml = `<xml><ToUserName><![CDATA[gh_10f6c3c3ac5a]]></ToUserName><FromUserName><![CDATA[oyORnuP8q7ou2gfYjqLzSIWZf0rs]]></FromUserName><CreateTime>1409735668</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[abcdteT]]></Content><MsgId>6054768590064713728</MsgId><Encrypt><![CDATA[hyzAe4OzmOMbd6TvGdIOO6uBmdJoD0Fk53REIHvxYtJlE2B655HuD0m8KUePWB3+LrPXo87wzQ1QLvbeUgmBM4x6F8PGHQHFVAFmOD2LdJF9FrXpbUAh0B5GIItb52sn896wVsMSHGuPE328HnRGBcrS7C41IzDWyWNlZkyyXwon8T332jisa+h6tEDYsVticbSnyU8dKOIbgU6ux5VTjg3yt+WGzjlpKn6NPhRjpA912xMezR4kw6KWwMrCVKSVCZciVGCgavjIQ6X8tCOp3yZbGpy0VxpAe+77TszTfRd5RJSVO/HTnifJpXgCSUdUue1v6h0EIBYYI1BD1DlD+C0CR8e6OewpusjZ4uBl9FyJvnhvQl+q5rv1ixrcpCumEPo5MJSgM9ehVsNPfUM669WuMyVWQLCzpu9GhglF2PE=]]></Encrypt></xml>`
const decryptTest = new WXBizMsgCrypt(token,encodingAESKey,appid);
try {
    const decryptedXml = decryptTest.decryptMsg(from_xml, msg_signature, timestamp, nonce)
    console.log(decryptedXml);
} catch (e) {
    console.log(e);
}
```

## 共建

Node JS的微信加解密库好用的不多。 欢迎大家共同贡献力量。

