var express = require('express');
var router = express.Router();
var comUserController = require("../controllers/ComUserController.js");

router.post('/getAccountInfo', comUserController.getAccountInfo);

router.post('/updatePhone', comUserController.updatePhone);

router.post('/getPhone', comUserController.getPhone);

router.post('/confirmGetCargo', comUserController.confirmGetCargo);

router.post('/confirmDeliver', comUserController.confirmDeliver);

router.post('/comment', comUserController.comment);



module.exports = router;
