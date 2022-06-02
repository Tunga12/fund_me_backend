const _ = require("lodash");
const express = require("express");
const { Donation, validate } = require("../models/donation");
const { Fundraiser } = require("../models/fundraiser");
const { Notification } = require("../models/notification");
const { User } = require("../models/user");
const { auth } = require("../middleware/auth");
const { newNotification } = require("../startup/connection");
const Fawn = require("fawn");
const mongoose = require("mongoose");
const admin = require("../middleware/admin");

const ObjectId = require("mongoose").Types.ObjectId;

//Fawn.init(mongoose);
const router = express.Router();

// Get all donations (for admin)
router.get("/", [auth, admin], async (req, res) => {
  const donations = await Donation.find().sort("-date");
  //.populate('fundraiser','title story image organizer');

  res.send(donations);
});

// for fundraiser donations

router.get("/getDonationsInfo/:fundId", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.fundId)) {
    return res.status(400).send("Invalid id");
  }

  const first = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  })
    .sort({ date: 1 })
    .limit(1)
    .populate("userId", "firstName lastName");

  const top = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  })
    .sort({ amount: -1 })
    .limit(1)
    .populate("userId", "firstName lastName");

  // the latest five donations with comments
  const withComments = await Donation.find({
    fundId: ObjectId(req.params.fundId),
    comment: { $ne: "" },
  })
    .sort({ date: -1 })
    .limit(5)
    .populate("userId", "firstName lastName");

  // the latest five donations (with or without comments)
  const all = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  })
    .sort({ date: -1 })
    .limit(5)
    .populate("userId", "firstName lastName");

  const allTop = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  })
    .sort({ amount: -1 })
    .limit(5)
    .populate("userId", "firstName lastName");

  const total = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  }).countDocuments();

  const totalComments = await Donation.find({
    fundId: ObjectId(req.params.fundId),
    comment: { $ne: "" },
  }).countDocuments();

  res.send({
    total: total, // total donations number
    totalComments: totalComments, // total donations with comments number
    first: first, // first donation array
    top: top, // top donation array
    withComments: withComments, // all donations with comments
    // these two are not needed on mobile
    all: all, // all donations ordered by date, latest
    allTop: allTop, // all donations ordered by greatest amount
  });
});

// get first donation of fundraiser
// router.get("/first/:fundId", async (req, res) => {
//   // check fundId
//   if (!mongoose.Types.ObjectId.isValid(req.params.fundId)) {
//     return res.status(400).send("Invalid id");
//   }

//   const donation = await Donation.find({
//     fundId: ObjectId(req.params.fundId),
//   })
//     .sort({ date: 1 })
//     .limit(1);

//   res.send(donation);
// });

// get top donation of fundraiser
// router.get("/top/:fundId", async (req, res) => {
//   // check fundId
//   if (!mongoose.Types.ObjectId.isValid(req.params.fundId)) {
//     return res.status(400).send("Invalid id");
//   }
//   const donation = await Donation.find({
//     fundId: ObjectId(req.params.fundId),
//   })
//     .sort({ amount: -1 })
//     .limit(1);

//   res.send(donation);
// });

//get donations with comment 5 at a time
router.get("/withComments/:fundId", async (req, res) => {
  // check fundId
  if (!mongoose.Types.ObjectId.isValid(req.params.fundId)) {
    return res.status(400).send("Invalid id");
  }
  const pageNumber = parseInt(req.query.pageNumber);
  const pageSize = 5;

  const donations = await Donation.find({
    fundId: ObjectId(req.params.fundId),
    comment: { $ne: "" },
  })
    .sort({ date: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate("userId", "firstName lastName");

  res.send(donations);
});

// get any donation (with or without comment) 5 at a time
router.get("/all/:fundId", async (req, res) => {
  // check fundId
  if (!mongoose.Types.ObjectId.isValid(req.params.fundId)) {
    return res.status(400).send("Invalid id");
  }
  const pageNumber = parseInt(req.query.pageNumber);
  const pageSize = 5;

  const donations = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  })
    .sort({ date: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate("userId", "firstName lastName");

  res.send(donations);
});

// get all donations ordered by highest amount
router.get("/allTop/:fundId", async (req, res) => {
  // check fundId
  if (!mongoose.Types.ObjectId.isValid(req.params.fundId)) {
    return res.status(400).send("Invalid id");
  }
  const pageNumber = parseInt(req.query.pageNumber);
  const pageSize = 5;

  const donations = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  })
    .sort({ amount: -1 , date: -1})
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate("userId", "firstName lastName");

  res.send(donations);
});

router.get('/total/:fundId', async (req, res)=> {

  if (!mongoose.Types.ObjectId.isValid(req.params.fundId)) {
    return res.status(400).send("Invalid id");
  }

  const total = await Donation.find({
    fundId: ObjectId(req.params.fundId),
  }).countDocuments();
})

// Get donation by id
router.get("/:id", async (req, res) => {
  const donation = await Donation.findOne({
    _id: req.params.id,
    // isDeleted: false,
  })
    .select("-isDeleted")
    .populate("userId", "firstName lastName email");

  if (!donation)
    return res.status(404).send("Donation with the given ID was not found.");

  res.send(donation);
});

//Get donations by memberId
router.get("/member/:uid", async (req, res) => {
  const donations = await Donation.find({
    memberId: req.params.uid,
    isDeleted: false,
  }).select("-isDeleted");

  res.send(donations);
});

// Return all donation made by a single user
router.get("/donor/:uid", async (req, res) => {
  const donations = await Donation.find({
    userId: req.params.uid,
    isDeleted: false,
  }).select("-isDeleted");
  // .populate('fundraiser','title story image organizer');

  res.send(donations);
});

// Get donation number in date range (for admin)
router.post("/count", [auth, admin], async (req, res) => {
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  console.log(startDate);
  console.log(endDate);

  const count = await Donation.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).countDocuments();

  res.send({ count: count });
});

// Get total raised in date range (for admin)
router.post("/totalRaised", [auth, admin], async (req, res) => {
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  const countBirr = await Donation.aggregate([
    {
      $match: {
        $and: [
          { paymentMethod: "telebirr" },
          { date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const countDollar = await Donation.aggregate([
    {
      $match: {
        $and: [
          { paymentMethod: "paypal" },
          { date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  console.log(countDollar);

  res.send({
    countBirr: countBirr.length != 0 ? countBirr[0].total : 0,
    countDollar: countDollar.length != 0 ? countDollar[0].total : 0,
  });
});

// Get total raised in date range (for admin)
router.post("/totalTip", [auth, admin], async (req, res) => {
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  const countBirr = await Donation.aggregate([
    {
      $match: {
        $and: [
          { paymentMethod: "telebirr" },
          { date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$tip",
        },
      },
    },
  ]);

  const countDollar = await Donation.aggregate([
    {
      $match: {
        $and: [
          { paymentMethod: "paypal" },
          { date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$tip",
        },
      },
    },
  ]);

  res.send({
    countBirr: countBirr.length != 0 ? countBirr[0].total : 0,
    countDollar: countDollar.length != 0 ? countDollar[0].total : 0,
  });
});

// Post a donation
router.post("/:fid", auth, async (req, res) => {
  let fund = await Fundraiser.findById(req.params.fid);
  if (!fund)
    return res.status(404).send("A fundraiser with the given ID was not found");

  req.body.userId = req.user._id;
  req.target = req.params.fid;
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let donation = new Donation(req.body);

  const id = mongoose.Types.ObjectId(req.params.fid);
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
  res.status(201).send(donation);

  //fund = await Fundraiser.findById(id);
  /*  var recp = [];
        recp.push(fund.organizer);
        const user = await User.findById(donation.userId);

        const newNot = new Notification({
            notificationType:'Donation',
            recipients: recp,
            title:`${fund.title}[Donation]`,
            content: `${user.firstName} ${user.lastName} donated ${donation.amount} birr.`,
            target: req.params.fid
            
        });
      //  newNot.target =  'jkkkkkkkkkkkkkkkkkjkjkkk';
       await newNotification(newNot); */
  // io.emit('notification',newNot);
});

// Update an donation
router.put("/:id", auth, async (req, res) => {
  req.body.userId = req.user._id;
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).select("-isDeleted");

  if (!donation)
    return res.status(404).send("Donation with the given ID was not found.");

  res.send(donation);
});

// Delete donation
router.delete("/:id", auth, async (req, res) => {
  const donation = await Donation.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!donation)
    return res.status(404).send("Donation with the given ID was not found.");

  //  res.send('Update is deleted');
  const task = new Fawn.Task();
  try {
    task
      .update("donation", { _id: donation._id }, { isDeleted: true })
      .update(
        "fundraisers",
        { donations: donation._id },
        { $pull: { donations: donation._id } }
      )
      .run();

    res.send("Donation is deleted");
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
