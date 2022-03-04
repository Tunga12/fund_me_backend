const _ = require("lodash");
const express = require("express");
const { Category, validate } = require("../models/category");
const { auth } = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  const categories = await Category.find().sort("name");
  res.send(categories);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id });
  if (!category)
    return res.status(404).send("Category with the given ID was not found.");
  res.send(category);
});

// Post a category
router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let category = new Category(_.pick(req.body, ["name"]));
  category = await category.save();

  res.send(category);
});

// Update a category
router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!category)
    return res
      .status(404)
      .send("The category with the given ID was not found.");

  res.send(category);
});

router.delete("/:id", async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);
  if (!category)
    return res.status(404).send("Category with the given ID was not found.");
  res.send("Category is deleted!");
});

module.exports = router;
