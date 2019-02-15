var Order = require("../models/Order");
var Driver = require("../models/Driver");
var User = require("../models/User");
var Need = require("../models/Need")
var NeedSchedule = require("../models/NeedSchedule")
var Weixin = require("../models/Weixin");
var fs = require('fs');
var path = require('path');

var orderController = {}

orderController.getOrderList = function (req, res) {
	var account_id = req.session.account_id
    
    console.log(account_id)

	Order.find({account: account_id}).populate({
		path: 'driver',
        model: 'Driver',
		populate: {
			path: 'user',
            model: 'User'
		}
	}).exec(function (err, order) {
        console.log(err)
        console.log(order)
        res.send({order:order})
    })
}


orderController.getOrderDetail = function (req,res) {
	var order_id = req.body.order_id
	var base_path = path.join(__dirname, '../public/img_tmp');
	var order_path =  '/img_tmp/order_' + order_id + '.png';
	var rootpath = req.app.get('rootpath')
	console.log('/public'+order_path)

	Need.findOne({
		_id:order_id,
		closed:false
	}).populate("truck").then(need=>{
		if(need){
			res.send({order:need})
		}
		else//去order找
		{
			fs.exists('./public'+order_path,function (exists) {
				console.log(exists)
				if(!exists)
				{
					console.log('not exist')
					Weixin.getWXACode(order_id,function () {})
				}
				else
				{
					console.log('exist')
				}

			})
			Order.findOne({
				"$or":[
					{
						_id:order_id
					},
					{
						need:order_id
					}
				]
			}).populate({
				path: 'driver',
				model: 'Driver',
				populate: {
					path: 'user',
					model: 'User'
				}
			}).populate("truck").then(order=>{
				console.log(order)
				res.send({order:order,image:order_path})
			})

		}

	})
}

//取消运单
orderController.cancleOrder = function (req,res) {
	var order_id = req.body.order_id
	Need.findOneAndUpdate(
		{
			_id:order_id,
			closed:false
		},
		{
			closed:true
		},
		{
			new:true
		},
		function (err,need) {
			if(need)
			{
				NeedSchedule.findByIdAndUpdate(
					need.need_schedule,
					{
						finished:true
					},
					function (err,needschedule) {
						if(err) throw err
						res.send({ok:1})
					}
				)
			}
			else
			{
				res.send({ok:0})
			}
		}
	)
}

module.exports = orderController
