const express = require("express");
const router = express();
const upload = require("../middleware/upload");
const { auth } = require("../middleware/auth");
const config = require("config");
const fs = require("fs");
const path = require("path");

router.use(express.urlencoded({ extended: true }));

router.post("/", [auth, upload.single("image")], (req, res) => {
  if (req.im) return res.status(400).send(req.im);
  res.status(201).send(`${config.get("url")}/` + req.file.path);
  // res.status(201).send('localhost:3000/' + req.file.path);
});

// delete previous photo after uploading new one
router.post("/changePhoto", [auth, upload.single("image")], (req, res) => {
  if (req.im) return res.status(400).send(req.im);

  var oldPath = req.body.oldPath;

  // Remove old photo
  if (oldPath) {
    console.log(oldPath);
    // const oldPath = path.join(__dirname, "..", "images", req.body.oldPath);
    oldPath = oldPath.replace(`${config.get("url")}/`, "");
    console.log(oldPath);
    if (fs.existsSync(oldPath)) {
      fs.unlink(oldPath, (err) => {
        if (err) {
          console.error(err);
          //   return;
        }
      });
    } else {
      console.log("path doesn't exist");
    }
  }

  res.status(201).send(`${config.get("url")}/` + req.file.path);
  // res.status(201).send('localhost:3000/' + req.file.path);
});

module.exports = router;
