var mongoose = require("mongoose");
var passport = require("passport");
var request = require('request');
var moment = require('moment');
var Order = require("../models/Order");
var Driver = require("../models/Driver")
var Weixin = require("../models/Weixin");
var ComUser = require("../models/ComUser");
var Config = require("../config/Config");
var Constant = require("../config/Constant")
var wxController = {};

wxController.getWxUserInfo = function(req, res) {

    console.log(req.body);

    var code = req.body.code;

    Weixin.getWxUserInfo(code, function (err, resp, data) {
        console.log("data: " + JSON.stringify(data));

        var openid = data.openid;
        var body = req.body;
        var refer_id = req.body.refer_id;
        var session_key = data.session_key;
        req.body.username = openid;
        req.body.password = "pwd";

        if(data.openid) {
            ComUser.findOne({'openid':openid}, function (err, user) {

                // 存在
                if(user) {
                    console.log("registered");
                    
                    console.log(user);

                    passport.authenticate('local')(req, res, function () {
                        req.session.uid = user._id;
                        res.json({user_id: user._id, s_id: 'sess:' + req.session.id,session_key:session_key, phone: user.phone});
                    });
                }
                // 不存在
                else {
                    console.log("begin register");

                    ComUser.register(
                        new ComUser({
                            username: openid,
                            openid : openid,
                            name: req.body.nickname,
                            avatar: req.body.avatar,
                            gender: req.body.gender,
                            city: req.body.city,
                            province: req.body.province,
                            country: req.body.country
                        }),
                        req.body.password,
                        function(err, user) {
                            console.log(user);
                            console.log(err);
                            if (err) {
                                res.send('fail');
                            }

                            passport.authenticate('local')(req, res, function () {
                                req.session.uid = user._id;
                                res.json({user_id: user._id, s_id: 'sess:' + req.session.id,session_key:session_key});
                            });
                        }
                    );
                }
            })
        }
    });
};

wxController.payNotify = function(req, res) {
    console.log("weixin pay notify");

    var xml = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        xml += chunk;
        console.log( chunk );
    });
    req.on('end', function(chunk) {
        console.log( xml );
        Weixin.verifyNotify( xml, function(out_trade_no, openid){
            console.log('out_trade_no:' +out_trade_no);
            if ( out_trade_no && openid ) {
            
            }
        });
    });
};


//我收的
wxController.myOrderList = function (req,res) {
	console.log('-----')

	var user_id = req.body.user_id
	ComUser.findById(user_id).then(user=>{
		console.log(user.phone)
		if(user.phone){
			Order.find({
				"to.phone":user.phone
			}).populate({
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
		else
		{
			res.send({order:[]})
		}
	})

}

//上传评价图片
wxController.company_comment_pic = function(req, res) {
	console.log(req.body)
	console.log(req.files)

	var user_id = req.body.user_id;

	var files = req.files
	var field_name = req.body.field_name
	var file = req.files[field_name]
	var order_id = req.body.order_id
	console.log(file)

	Order.findById(order_id).then(order=>{
		if(!order) return

		if(file.size>0) {
			var tmp_path = file.path
			var key = "comments/" + order_id + "/company/" + field_name+".png"

			CosUploader.uploadFile(tmp_path, key, function (err, data) {
				if(err) {
					res.send('')
				}
				var image_src = Config.cos.host + '/' + key;
				console.log(image_src)
				res.send(image_src)

			})
		}
		else {
			res.send('')
		}
	})
}

//上传投诉图片
wxController.company_tousu_pic = function(req, res) {
	console.log(req.body)
	console.log(req.files)

	var user_id = req.body.user_id;

	var files = req.files
	var field_name = req.body.field_name
	var file = req.files[field_name]
	var order_id = req.body.order_id
	console.log(file)

	Order.findById(order_id).then(order=>{
		if(!order) return

		if(file.size>0) {
			var tmp_path = file.path
			var key = "tousu/" + order_id + "/" + field_name+".png"

			CosUploader.uploadFile(tmp_path, key, function (err, data) {
				if(err) {
					res.send('')
				}
				var image_src = Config.cos.host + '/' + key;
				console.log(image_src)
				res.send(image_src)

			})
		}
		else {
			res.send('')
		}
	})
}

//投诉
wxController.tousu = function (req,res) {
	var order_id = req.body.order_id
	var phone = req.body.phone

	Order.findOneAndUpdate(
		{
			'_id': order_id
		},
		{
			tousu_to_driver: JSON.parse(req.body.tousu_to_driver),
			state:Constant.ORDER_STATE.COMPANY_TOUSU_DELIVER
		},
		{
			new: true
		},
		function (err, order) {
			if(err) throw err
			res.send({ok:1})
		})

}


//确认收货
wxController.confirmDeliver = function (req, res) {
	var phone = req.body.phone
	var order_id = req.body.order_id

	Order.findOneAndUpdate(
		{
			'_id': order_id,
			state: Constant.ORDER_STATE.DRIVER_CONFIRM_DELIVER
		},
		{
			state: Constant.ORDER_STATE.COMPANY_CONFIRM_DELIVER,
			company_confirm_deliver_at: JSON.parse(req.body.company_confirm_deliver_at)
		},
		{
			new: true
		},
		function (err, order) {
			if(err) throw err
			console.log(order);

			Driver.findByIdAndUpdate(
				order.driver,
				{
					in_service: false,
					current_order: null
				},
				function (err, driver) {
					if(err) throw err
					console.log(order);
					res.send({ok:1})
				}
			)
		}
	)
}

//评价
wxController.comment = function (req, res) {
	var phone = req.body.phone
	var order_id = req.body.order_id

	Order.findOneAndUpdate(
		{
			'_id': order_id
		},
		{
			comment_to_driver: JSON.parse(req.body.comment_to_driver)
		},
		{
			new: true
		},
		function (err, order) {
			if(err) throw err

			if(order.comment_to_company.content) {
				order.state = Constant.ORDER_STATE.COMMENTED
				order.save(function (err) {
					if(err) throw err

					//更新司机统计信息
					var distance = order.distance
					var star = order.comment_to_driver.points
					var day = (new Date().getTime()/1000 - order.driver_confirm_cargo_at.time)/(60*60*24)

					Driver.findOneAndUpdate({
							_id:order.driver
						},
						{
							$inc:{comment_num:1}
						},
						{new: true},
						function (err,driver) {
							console.log(driver)
							if(err) throw err
							if(!driver.star){
								driver.star = 5
							}
							if(!driver.distance){
								driver.distance = 0
							}
							if(!driver.day){
								driver.day = 0
							}
							if(!driver.num){
								driver.num = 0
							}
							var newstar = (star + driver.star) / (driver.comment_num)
							driver.num = driver.num + 1
							driver.day = driver.day + day
							driver.distance = driver.distance + distance
							driver.star = newstar
							driver.save(function (err) {
								if(err) throw err
								res.send({ok:1})
							})
						})

				})
			}
			else {
				res.send({ok:1})
			}
		}
	)
}

module.exports = wxController;
