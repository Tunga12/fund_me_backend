const Joi = require("joi");
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  //   userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true,
  //   },
  //   fundraiserId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Fundraiser",
  //     required: true,
  //   },
  //   reason: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "ReportReason",
  //     required: true,
  //   },
  //   date: {
  //     type: Date,
  //     default: Date.now,
  //   },
  //   isDeleted: {
  //     type: Boolean,
  //     default: false,
  //   },

  // new
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  knowsOrganizer: {
    type: Boolean,
    required: true,
  },
  knowsDescription: {
    type: String,
  },
  reasonType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReportReason",
    required: true,
  },
  reasonDescription: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "resolved", "lacksinfo"],
    lowercase: true,
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model("Report", reportSchema);

function validateReport(report) {
  const schema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().min(10).required(),
    email: Joi.string().email().required(),
    url: Joi.string().required(),
    knowsOrganizer: Joi.boolean().required(),
    knowsDescription: Joi.string(),
    reasonType: Joi.objectId().required(),
    reasonDescription: Joi.string().required(),
    userId: Joi.objectId().required(),
    status: Joi.string().valid("pending", "resolved", "lacksinfo"),
  });

  return schema.validate(report);
}

function validateUpdate(report) {
  const schema = Joi.object({
    status: Joi.string().valid("pending", "resolved", "lacksinfo").required(),
  });

  return schema.validate(report);
}

module.exports.Report = Report;
module.exports.validate = validateReport;
module.exports.validateUpdate = validateUpdate;
