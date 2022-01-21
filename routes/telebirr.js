const express = require("express");
const router = express.Router();
const timestamp = require("unix-timestamp");
const { v4: uuidv4 } = require("uuid");

const fetch = require("node-fetch");
const crypto = require("crypto");
const NodeRSA = require("node-rsa");

const {
  PendingDonation,
  validatePayReq,
  validatePaymentMobile,
} = require("../models/pending_donation");
const Fawn = require("fawn");
const mongoose = require("mongoose");
const { Donation } = require("../models/donation");
const { auth } = require("../middleware/auth");

let publicKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3QIDAQAB";

// sent form web app
router.post("/pay", [auth], async (req, res) => {
  console.log(`pay: ${JSON.stringify(req.body)}`);

  req.body.donation.userId = req.user._id;
  // validate request
  const { error } = validatePayReq(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let pendingDonation = new PendingDonation(req.body.donation);
  pendingDonation = await pendingDonation.save();

  const appKey = "ffbf324b21974d778cec063f17aa1367";
  let signObj = {
    appId: "4347b88db6e64e0baa9e588acd42d50c",
    nonce: uuidv4(),
    notifyUrl: "http://178.62.55.81/api/telebirr/result",
    outTradeNo: pendingDonation._id,
    returnUrl: req.body.returnUrl,
    shortCode: "410028",
    subject: req.body.subject,
    timeoutExpress: "30",
    timestamp: timestamp.now().toString(),
    totalAmount:
      req.body.donation.amount +
      (req.body.donation.amount * req.body.donation.tip) / 100,
    receiveName: "Highlight Software Design",
  };
  signObj.appKey = appKey;
  let stringA = jsonSort(signObj);

  console.log(`stringA: ${stringA}`);

  let stringB = sha256(stringA);

  let sign = stringB.toUpperCase();

  let ussdjson = JSON.stringify(signObj);

  console.log(`ussdJson: ${ussdjson}`);

  // let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3QIDAQAB";

  let ussd = rsa_encrypt(ussdjson, publicKey);

  let requestMessage = { appid: signObj.appId, sign: sign, ussd: ussd };

  console.log(`request: ${JSON.stringify(requestMessage)}`);

  try {
    const response = await fetch(
      "http://196.188.120.3:11443/service-openup/toTradeWebPay",
      {
        method: "post",
        body: JSON.stringify(requestMessage),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    console.log(`response: ${data}`);

    res.send(data);
  } catch (error) {
    res.send(`Error: ${error}`);
  }
});

// sent form web app
router.post("/payMobile", [auth], async (req, res) => {
  // validate request

  console.log(`pay: ${JSON.stringify(req.body)}`);

  req.body.donation.userId = req.user._id;
  // validate request
  const { error } = validatePaymentMobile(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let pendingDonation = new PendingDonation(req.body.donation);
  pendingDonation = await pendingDonation.save();

  res.send(pendingDonation._id);

  // const appKey = 'ffbf324b21974d778cec063f17aa1367';
  // let signObj = {
  //     "appId": "4347b88db6e64e0baa9e588acd42d50c",
  //     "nonce": uuidv4(),
  //     "notifyUrl": "http://178.62.55.81/api/telebirr/result",
  //     "outTradeNo": pendingDonation._id,
  //     "shortCode": "410028",
  //     "subject": req.body.subject,
  //     "timeoutExpress": "30",
  //     "timestamp": timestamp.now().toString(),
  //     "totalAmount": req.body.donation.amount + req.body.donation.tip,
  //     "receiveName": "Highlight Software Design",
  //     // "returnApp": { "PackageName": "cn.tydic.ethiopay", "Activity": "cn.tydic.ethiopay.PayForOtherAppActivity" }
  //     "returnApp": "com.example.crowd_funding_app"
  // };
  // signObj.appKey = appKey;
  // let stringA = jsonSort(signObj);

  // console.log(`stringA: ${stringA}`)
  // console.log(`returnApp= { "PackageName": "cn.tydic.ethiopay", "Activity": "cn.tydic.ethiopay.PayForOtherAppActivity" }`)

  // let stringB = sha256(stringA);

  // let sign = stringB.toUpperCase()

  // let ussdjson = JSON.stringify(signObj);

  // console.log(`ussdJson: ${ussdjson}`)

  // let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3QIDAQAB";

  // let ussd = rsa_encrypt(ussdjson, publicKey);

  // let requestMessage = { appid: signObj.appId, sign: sign, ussd: ussd };

  // console.log(`request: ${JSON.stringify(requestMessage)}`);

  // try {
  //     const response = await fetch("http://196.188.120.3:11443/service-openup/toTradeMobielPay", {
  //         method: 'post',
  //         body: JSON.stringify(requestMessage),
  //         headers: { 'Content-Type': 'application/json' }
  //     });

  //     const data = await response.json();
  //     console.log(`response: ${data}`)

  //     res.send(data);
  // } catch (error) {
  //     res.send(`Error: ${error}`)
  // }
});

// sent from telebirr server
router.post("/result", async (req, res) => {
  console.log(`result: ${req.body}`);

  let result = rsa_decrypt(req.body, publicKey);
  result = JSON.parse(result);

  console.log(`decrypted result: ${result}`);

  // remove double quotes from first and last index
  //result.outTradeNo = result.outTradeNo.replaceAll("^\"|\"$", "");
  result.outTradeNo = result.outTradeNo.split('\"').join("");

  let pendingDonation = await PendingDonation.findById(result.outTradeNo);

  if (pendingDonation) {
    console.log(`pendingDonation._id: ${pendingDonation}`);

    createDonation(pendingDonation);
    // await PendingDonation.deleteOne(pendingDonation._id)
    res.send({ code: 0, msg: "success" });
  } else {
    console.log("pending donation doesn't exist");
    res.send("pending donation doesn't exist");
  }
});

function createDonation(pendingDonation) {
  console.log(`createDonation: ${pendingDonation}`);

  // const id = mongoose.Types.ObjectId(pendingDonation.fundId);
  const id = pendingDonation.fundId;

  delete pendingDonation.fundId;

  let donation = pendingDonation;
  // let donation = new Donation(pendingDonation);

  const task = new Fawn.Task();
  if (donation.paymentMethod.toLowerCase() === "telebirr") {
    try {
      task
        .save("donations", donation)
        .update(
          "fundraisers",
          { _id: id },
          {
            $push: { donations: { $each: [donation._id], $sort: -1 } },
            $inc: { "totalRaised.birr": donation.amount },
          }
        )
        .update(
          "teammembers",
          { _id: donation.memberId },
          { $inc: { "hasRaised.birr": donation.amount } }
        )
        .run();
    } catch (e) {
      console.log(e.message);
      res.status(500).send("Something went wrong");
    }
  } else {
    try {
      task
        .save("donations", donation)
        .update(
          "fundraisers",
          { _id: id },
          {
            $push: { donations: { $each: [donation._id], $sort: -1 } },
            $inc: { "totalRaised.dollar": donation.amount },
          }
        )
        .update(
          "teammembers",
          { _id: donation.memberId },
          { $inc: { "hasRaised.dollar": donation.amount } }
        )
        .run();
    } catch (e) {
      console.log(e.message);
      res.status(500).send("Something went wrong");
    }
  }
}

//*************helper functions */

// sort the parameters in alphabetical order and add = and & between them
function jsonSort(jsonObj) {
  let arr = [];
  for (var key in jsonObj) {
    arr.push(key);
  }
  arr.sort();
  let str = "";
  for (var i in arr) {
    if (arr[i] == "returnApp") {
      console.log("in return app");
      str += arr[i] + "=" + jsonObj[arr[i]].toString() + "&";
    } else {
      str += arr[i] + "=" + jsonObj[arr[i]] + "&";
    }
  }
  return str.substr(0, str.length - 1);
}

// create a hash of body
function sha256(data) {
  var hash = crypto.createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}

const rsa_encrypt = (data, publicKey) => {
  let key = new NodeRSA(getPublicKey(publicKey));
  key.setOptions({ encryptionScheme: "pkcs1" });
  let encryptKey = key.encrypt(data, "base64");
  return encryptKey;
};

const rsa_decrypt = (data, publicKey) => {
  let key = new NodeRSA(getPublicKey(publicKey));
  key.setOptions({ encryptionScheme: "pkcs1" });
  let decryptKey = key.decryptPublic(data, "utf8");
  return decryptKey;
};

function insertStr(str, insertStr, sn) {
  var newstr = "";
  for (var i = 0; i < str.length; i += sn) {
    var tmp = str.substring(i, i + sn);
    newstr += tmp + insertStr;
  }
  return newstr;
}

const getPublicKey = function (key) {
  const result = insertStr(key, "\n", 64);
  return "-----BEGIN PUBLIC KEY-----\n" + result + "-----END PUBLIC KEY-----";
};

module.exports = router;
