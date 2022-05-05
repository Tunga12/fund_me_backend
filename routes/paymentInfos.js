const _ = require("lodash");
const express = require("express");
const { PaymentInfo, validate } = require("../models/paymentInfo");
const { auth } = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");

const router = express.Router();

// Get all paymentInfos
router.get("/", async (req, res) => {
  const paymentInfos = await PaymentInfo.find({ isDeleted: false }).sort(
    "shortcodeTelebirr"
  );
  res.send(paymentInfos);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid id");
  }
  const paymentInfo = await PaymentInfo.findOne({ _id: req.params.id });
  if (!paymentInfo)
    return res.status(404).send("PaymentInfo with the given ID was not found.");
  res.send(paymentInfo);
});

router.get("/search/:shortcode", async (req, res) => {
  // has to be exactly that number, so no regex
  const paymentInfo = await PaymentInfo.findOne({
    shortcodeTelebirr: req.params.shortcode,
  });
  if (!paymentInfo)
    return res.status(404).send("PaymentInfo with the given ID was not found.");
  res.send(paymentInfo);
});

// Post a PaymentInfo
router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let paymentInfo = new PaymentInfo(
    _.pick(req.body, ["shortcodeTelebirr", "appIdTelebirr", "appKeyTelebirr"])
  );
  paymentInfo = await paymentInfo.save();

  res.send(paymentInfo);
});

// Update a PaymentInfo
router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const paymentInfo = await PaymentInfo.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  if (!paymentInfo)
    return res
      .status(404)
      .send("The PaymentInfo with the given ID was not found.");

  res.send(paymentInfo);
});

// what happens after we delete, what about the references
// may be add a deleted field?
router.delete("/:id", async (req, res) => {
  const paymentInfo = await PaymentInfo.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );
  if (!paymentInfo)
    return res.status(404).send("PaymentInfo with the given ID was not found.");
  res.send("PaymentInfo is deleted!");
});

module.exports = router;
