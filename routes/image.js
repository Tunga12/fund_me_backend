const express = require('express');
const router = express();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.use(express.urlencoded({extended :true})); 

router.post('/',[auth,upload.single('image')] ,(req, res) => {
    if(req.im) return res.status(400).send(req.im.err);
    res.status(201).send(' https://shrouded-bastion-52038.herokuapp.com/' + req.file.path);
});

module.exports = router;