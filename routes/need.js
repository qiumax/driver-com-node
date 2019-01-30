var express = require('express');
var router = express.Router();
var needController = require("../controllers/NeedController.js");

router.post('/getNeedPrice', needController.getNeedPrice);

router.post('/publishNeed', needController.publishNeed);

router.post('/getTruck', needController.getTruck);

router.post('/getNeedsFollowup', needController.getNeedsFollowup);

router.post('/getPrice', needController.getPrice);

module.exports = router;
