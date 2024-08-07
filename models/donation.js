const Joi = require("joi");
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
    required: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true,
  },
  // added here
  fundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fundraiser",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tip: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["paypal", "telebirr"],
    lowercase: true,
    required: true,
  },
  comment: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Donation = mongoose.model("Donation", donationSchema);

function validateDonation(donation) {
  const schema = Joi.object({
    userId: Joi.objectId().allow(null),
    memberId: Joi.objectId().required(),
    name: Joi.string().required(),
    email: Joi.string().min(5).max(255).required().email().required(),
    fundId: Joi.objectId().required(),
    amount: Joi.number().required(),
    tip: Joi.number().required(),
    paymentMethod: Joi.string().valid("paypal", "telebirr").required(),
    comment: Joi.string(),
    date: Joi.date(),
    isAnonymous: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });

  return schema.validate(donation);
}

module.exports.Donation = Donation;
module.exports.validate = validateDonation;

//User.findByIdAndUpdate(user._id, { $addToSet: { purchasedBookIds: book._id } }).exec();
