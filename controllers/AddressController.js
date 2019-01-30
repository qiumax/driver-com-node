var Account = require("../models/Account");
var Address = require("../models/Address");

var addressController = {};

addressController.getAddress = function (req, res) {
    var user_id = req.body.user_id
    var account_id = req.session.account_id
    var body = req.body
    
    Address.find({account: account_id}).then(address => {
        res.send({address:address})
    })
}

addressController.addAddress = function (req, res) {
    var user_id = req.body.user_id
    var account_id = req.session.account_id
    var body = req.body
    
    var address = new Address(
        {
            account: account_id,
            city: body.city,
            address: body.address,
            note: body.note,
            name: body.name,
            phone: body.phone,
            longitude: body.longitude,
            latitude: body.latitude
        }
    )
    
    address.save(function (err) {
        if(err) throw err
        Account.findByIdAndUpdate(account_id,
            {
                $push: {addresses: address._id}
            },
            {new: true},
            function (err, account) {
                console.log(account);
                res.send({ok:1})
            }
        )
    })
}

addressController.updateAddress = function (req, res) {
    var account_id = req.session.account_id
    
    var body = req.body
    var address_id = body.address_id
    
    Address.findOneAndUpdate(
        {
            _id: address_id,
            account: account_id
        },
        {
            city: body.city,
            address: body.address,
            note: body.note,
            name: body.name,
            phone: body.phone,
            longitude: body.longitude,
            latitude: body.latitude
        },
        {new: true},
        function (err, account) {
            console.log(account);
            res.send({ok:1})
        }
    )
}

addressController.delAddress = function (req, res) {
    var account_id = req.session.account_id
    var address_id = req.body.address_id
    
    Address.deleteOne({
        _id: address_id,
        account: account_id
    }, function (err) {
        if(err) throw err
        res.send({ok:1})
    })
}

addressController.setDefaultAddress = function (req, res) {
    var account_id = req.session.account_id
    var address_id = req.body.address_id
    
    Account.findByIdAndUpdate(
        account_id,
        {
            default_address: address_id,
        },
        {new: true},
        function (err, account) {
            console.log(account);
            res.send({ok:1})
        }
    )
}

module.exports = addressController;
