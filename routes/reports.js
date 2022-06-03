const mongoose = require("mongoose");
const express = require("express");
const { Report, validate, validateUpdate } = require("../models/report");
const { auth } = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express();
//helps
//help
// Get all reports
router.get("/", [auth, admin], async (req, res) => {
  const PendingReports = await Report.find({ status: "pending" })
    .sort("-date")
    .populate("reasonType", "name");

  const LacksInfoReports = await Report.find({ status: "lacksinfo" })
    .sort("-date")
    .populate("reasonType", "name");

  const ResolvedReports = await Report.find({ status: "resolved" })
    .sort("-date")
    .populate("reasonType", "name");

  res.send({
    pending: PendingReports,
    laksInfo: LacksInfoReports,
    resolved: ResolvedReports,
  });
});

//get reports grouped by fundraiser
router.get("/byFund", [auth, admin], async (req, res) => {
  // returns _id: the fundraiser id
  // count: the number of reports for that fundraising
  // fund: an array containing the fundraiser title and totalRaised
  const reportsByFund = Report.aggregate([
    {
      $match: {
        status: "pending",
      },
    },
    {
      $group: {
        _id: "$fundraiserId",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
        date: -1,
      },
    },
    {
      $lookup: {
        from: "fundraisers",
        localField: "_id",
        foreignField: "_id",
        as: "fund",
      },
    },
    {
      $project: {
        "fund.title": 1,
        "fund.totalRaised": 1,
        count: 1,
      },
    },
  ]);

  res.send(reportsByFund);
});

router.get("/:id", [auth, admin], async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id }).populate(
    "reasonType",
    "name"
  );
  if (!report)
    return res.status(404).send("Report with the given ID was not found.");
  res.send(report);
});

// Post a report
router.post("/", auth, async (req, res) => {
  req.body.userId = req.user._id;
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // has the user filled a report on this fundraising before
  let report = await Report.findOne({
    fundraiserId: req.body.fundraiserId,
    userId: req.body.userId,
  });

  if (report)
    return res.status(400).send("You have already reported this fundraiser.");

  report = new Report(req.body);
  report = await report.save();

  res.send(report);
});

// Update the status of the report
router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid id");
  }

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
    }
  );

  if (!report)
    return res.status(404).send("Report with the given ID was not found.");

  res.send(report);
});

router.delete("/:id", auth, async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  if (!report)
    return res.status(404).send("Report with the given ID was not found.");

  res.send("Report is deleted");
});

module.exports = router;
