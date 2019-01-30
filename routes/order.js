var express = require('express');
var router = express.Router();
var orderController = require("../controllers/OrderController.js");

router.post('/getOrderList', orderController.getOrderList);

router.post('/getOrderDetail', orderController.getOrderDetail)


module.exports = router;
