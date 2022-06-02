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
const { PaymentInfo } = require("../models/paymentInfo");
const { auth } = require("../middleware/auth");

let publicKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjVUzAaCSeM2C+1Bw9BK2QE9Z5PkdAgY4IuojenkbmitYtBYbN3fvuFBn/8/KlT1DtgFxuclfeYN+zngTQMezF9W7nFy5Yr4R3asaU30PyLYOS+sMbnorwsJemZ6aJi4OXp5srCFdSOk3zt+hHRzBcVDwBq5b1hEWDW21W5KkO0SrCabUiN8JS4K63De9X41OO4HAtoZgfqOz0RWJN3RcM/q2y0i86+ektaVKdyxmo2cEOjX0gYLEvm2mmehBoT3nKDrbZdRkP43iWp6VoBjd1DEqYxbjECqtclRK/eXt+I9DrXGos3HmIn5nh1PsNzB3N4PsSfvD2m6LBjBp8RyXlQIDAQAB";

// sent form web app
router.post("/pay", async (req, res) => {
  console.log(`pay: ${JSON.stringify(req.body)}`);

  // req.body.donation.userId = req.user._id;
  // validate request
  const { error } = validatePayReq(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let pendingDonation = new PendingDonation(req.body.donation);
  pendingDonation = await pendingDonation.save();

  // fetch paymentInfo
  let paymentInfo = await PaymentInfo.findById(req.body.paymentInfo);

  // const appKey = "3a533a5b9fac46be80a2bc59adeb29e2";
  const appKey = paymentInfo.appKeyTelebirr;
  let signObj = {
    appId: paymentInfo.appIdTelebirr,
    // appId: "c1bf3deacf954f05aba1ea7ee7fd4bbc",
    nonce: uuidv4(),
    notifyUrl: "https://legasfund.com/api/telebirr/result",
    outTradeNo: pendingDonation._id,
    returnUrl: req.body.returnUrl,
    shortCode: paymentInfo.shortcodeTelebirr,
    // shortCode: "500383",
    subject: `Donating for ${paymentInfo.name}`,
    timeoutExpress: "30",
    timestamp: timestamp.now().toString(),
    totalAmount: req.body.donation.amount,
    receiveName: paymentInfo.name,
  };
  signObj.appKey = appKey;
  let stringA = jsonSort(signObj);

  console.log(`stringA: ${stringA}`);

  let stringB = sha256(stringA);

  let sign = stringB.toUpperCase();

  let ussdjson = JSON.stringify(signObj);

  console.log(`ussdJson: ${ussdjson}`);

  let ussd = rsa_encrypt(ussdjson, publicKey);

  let requestMessage = { appid: signObj.appId, sign: sign, ussd: ussd };

  console.log(`request: ${JSON.stringify(requestMessage)}`);

  try {
    const response = await fetch(
      "https://app.ethiomobilemoney.et:2121/ammapi/payment/service-openup/toTradeWebPay",
      {
        method: "post",
        body: JSON.stringify(requestMessage),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    console.log(`response: ${JSON.stringify(data)}`);

    res.send(data);
  } catch (error) {
    res.send(`Error: ${error}`);
  }
});

// sent form web app
router.post("/payMobile", async (req, res) => {
  // validate request

  console.log(`pay: ${JSON.stringify(req.body)}`);

  req.body.donation.userId = req.user._id;
  // validate request
  const { error } = validatePaymentMobile(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let pendingDonation = new PendingDonation(req.body.donation);
  pendingDonation = await pendingDonation.save();

  res.send(pendingDonation._id);
});

// sent from telebirr server
router.post("/result", async (req, res) => {
  console.log(`result: ${req.body}`);

  let result = rsa_decrypt(req.body, publicKey);
  result = JSON.parse(result);

  console.log(`decrypted result: ${JSON.stringify(result)}`);

  // remove double quotes from first and last index
  //result.outTradeNo = result.outTradeNo.replaceAll("^\"|\"$", "");
  result.outTradeNo = result.outTradeNo.split('"').join("");

  // whether the payment is sucessfull or not is indicated by the tradeStatus
  console.log(`tradeStatus: ${result.tradeStatus}`);
  if (result.tradeStatus != 2) {
    console.log("in tradeStatus if");
    // tradeStatus = 4
    if (result.tradeStatus == 4) {
      console.log("Payment is cancelled");
      res.send({ code: 0, msg: "success" });
      return;
    } else {
      console.log("Payment not successful. Check phone message");
      res.send({ code: 0, msg: "success" });
      return;
    }
  }

  let pendingDonation = await PendingDonation.findById(result.outTradeNo);

  if (pendingDonation) {
    console.log(`pendingDonation._id: ${pendingDonation}`);

    // createDonation(pendingDonation);
    // await PendingDonation.deleteOne(pendingDonation._id)

    const id = pendingDonation.fundId;

    // delete pendingDonation.fundId;

    let donation = pendingDonation;
    // let donation = new Donation(pendingDonation);

    let existingDonation = await Donation.findById(donation._id);
    if (existingDonation) {
      console.log("donation exists!!!");
      return;
    }

    const task = new Fawn.Task();
    if (donation.paymentMethod.toLowerCase() == "telebirr") {
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
        .remove("pending_donations", { _id: pendingDonation._id })
        .run({ useMongoose: true })
        .then(function (results) {
          res.send({ code: 0, msg: "success" });
        })
        .catch(function (err) {
          // Everything has been rolled back.

          // log the error which caused the failure
          console.log(err);
          res.send({ code: 0, msg: "success" });
        });
    } else {
      console.log("Payment method is not telebirr!!!");
      res.send({ code: 0, msg: "success" });
    }
  } else {
    console.log("pending donation doesn't exist");
    // res.send("pending donation doesn't exist");
    res.send({ code: 0, msg: "success" });
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
  if (donation.paymentMethod.toLowerCase() == "telebirr") {
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
        .run({ useMongoose: true })
        .then(function (results) {});

      return true;
    } catch (e) {
      console.log(e);
      // res.status(500).send("Something went wrong");
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
        .run({ useMongoose: true });

      return true;
    } catch (e) {
      console.log(e);
      // res.status(500).send("Something went wrong");
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
