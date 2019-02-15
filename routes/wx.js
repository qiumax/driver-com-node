var express = require('express');
var router = express.Router();
var wxController = require("../controllers/WxController.js");

var mutipart= require('connect-multiparty');
var mutipartMiddeware = mutipart();

router.post('/getWxUserInfo', wxController.getWxUserInfo);

router.post('/payNotify', wxController.payNotify);

router.post('/company_comment_pic', mutipartMiddeware, wxController.company_comment_pic);

router.post('/company_tousu_pic', mutipartMiddeware, wxController.company_tousu_pic);

router.post('/tousu', wxController.tousu);

router.post('/confirmDeliver', wxController.confirmDeliver);

router.post('/comment', wxController.comment);

//我收的
router.post('/myOrderList',wxController.myOrderList);

router.post('/order_wxcode',wxController.order_wxcode);

router.get('/test', function (req, res) {
    console.log("server 1");
    res.send("server 1")
});

module.exports = router;