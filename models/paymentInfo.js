const Joi = require("joi");
const mongoose = require("mongoose");

const paymentInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  shortcodeTelebirr: {
    type: Number,
    required: true,
  },
  appIdTelebirr: {
    type: String,
    required: true,
  },
  appKeyTelebirr: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const PaymentInfo = mongoose.model("PaymentInfo", paymentInfoSchema);

function validatePaymentInfo(paymentInfo) {
  const schema = Joi.object({
    name: Joi.string().required(),
    shortcodeTelebirr: Joi.number().required(),
    appIdTelebirr: Joi.string().required(),
    appKeyTelebirr: Joi.string().required(),
  });

  return schema.validate(paymentInfo);
}

module.exports.PaymentInfo = PaymentInfo;
module.exports.validate = validatePaymentInfo;
