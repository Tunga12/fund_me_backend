const Joi = require("joi");
const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
  },
  bankAccountNo: {
    type: String,
    required: true,
  },
  isOrganizer: {
    type: Boolean,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  reason: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  // add user because we need to see user name on admin side, i can get fundraiser.organizer / .beneficiary
  // add fundraiser because we need fundraiser link on admin side
  fundraiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fundraiser",
  },
});
withdrawSchema.plugin(require("mongoose-paginate-v2"));
const Withdraw = mongoose.model("Withdraw", withdrawSchema);

function validateWithdraw(withdraw) {
  const schema = Joi.object({
    bankName: Joi.string().required(),
    bankAccountNo: Joi.string().required(),
    isOrganizer: Joi.boolean().required(),
    status: Joi.string(),
    reason: Joi.string(),
    date: Joi.date(),
    isDeleted: Joi.boolean(),
    fundraiser: Joi.objectId().required(),
  });

  return schema.validate(withdraw);
}

function getPagination(page, size) {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return { limit, offset };
}

module.exports.Withdraw = Withdraw;
module.exports.validate = validateWithdraw;
module.exports.getPagination = getPagination;
