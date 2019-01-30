var express = require('express');
var router = express.Router();
var addressController = require("../controllers/AddressController.js");

router.post('/getAddress', addressController.getAddress);

router.post('/addAddress', addressController.addAddress);

router.post('/delAddress', addressController.delAddress);

router.post('/updateAddress', addressController.updateAddress);

router.post('/setDefaultAddress', addressController.setDefaultAddress);

module.exports = router;
