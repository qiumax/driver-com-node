var ComUser = require("../models/ComUser");
var Account = require("../models/Account");
var Address = require("../models/Address");
var Order = require("../models/Order");
var Driver = require("../models/Driver");
var RedisClient = require("../models/Redis");
var Weixin = require("../models/Weixin");
var WXBizDataCrypt = require("../models/WXBizDataCrypt");
var Config = require("../config/Config");
var Constant = require("../config/Constant")

var comUserController = {};

comUserController.getAccountInfo = function (req, res) {
    var user_id = req.body.user_id;
    
    ComUser.findById(user_id).then(user=>{
    	console.log('---')
        console.log(user);
        if(user) {
            Account.findOne({
            	phone: user.phone,
	            state:true,
	            deleted:false
            })
            .populate({
                path: 'company',
                select: 'name address province city license_number license_image price_dun price_fang state'
            })
            .then(account=>{
            	console.log('-----')
                if(account) {
                    console.log(account);
                    
                    // session account_id
                    var session_id = req.body.s_id;
                    RedisClient.get(session_id, function (err, reply) {
                        if(reply) {
                            var sess = JSON.parse(reply);
                            sess.account_id = account._id;
                            var sess_str = JSON.stringify(sess);
                            RedisClient.set(session_id, sess_str, function (err, reply2) {
                                console.log(reply2);
                                res.send(account)
                            })
                        }
                    })
                }
                else
                {
                	res.send({ok:0})
                }
            })
        }
        else
        {
	        res.send({ok:0})
        }
    })
}

comUserController.updatePhone = function (req, res) {
    var user_id = req.body.user_id;
    var phone = req.body.phone;
    if(phone.length>0) {
        ComUser.findByIdAndUpdate(user_id,
            {
                phone: phone
            },
            {new: true},
            function (err, user) {
                res.send({ok:1})
            }
        )
    }
}

comUserController.getPhone = function (req, res) {
    var appId = Config.wx.appid;
    var sessionKey = req.body.session_key;
    var encryptedData =req.body.encryptedData;
    var iv = req.body.iv;

    var pc = new WXBizDataCrypt(appId, sessionKey)

    var data = pc.decryptData(encryptedData , iv)
	console.log(data)
    res.send(data);
}


comUserController.confirmGetCargo = function (req, res) {
    var account_id = req.session.account_id
    var order_id = req.body.order_id
    
    Order.findOneAndUpdate(
        {
            _id: order_id,
            account: account_id,
            state: Constant.ORDER_STATE.DRIVER_CONFIRM_CARGO
        },
        {
            state: Constant.ORDER_STATE.COMPANY_CONFIRM_CARGO,
            company_confirm_cargo_at: JSON.parse(req.body.company_confirm_cargo_at)
        },
        {
            new: true
        },
        function (err, order) {
            if(err) throw err
            console.log(order);
            res.send({ok:1})
        }
    )
}

comUserController.confirmDeliver = function (req, res) {
    var account_id = req.session.account_id
    var order_id = req.body.order_id
    
    Order.findOneAndUpdate(
        {
            _id: order_id,
            account: account_id,
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

//二维码
comUserController.orderwxcode = function (req,res) {
	var order_id = req.body.order_id
	var base_path = path.join(__dirname, '../public/img_tmp');
	Weixin.getWXACode(order_id,function () {
		var order_path = base_path + '/order_' + order_id + '.png';
		res.send({image:order_path})
	})
}

comUserController.comment = function (req, res) {
    var account_id = req.session.account_id
    var order_id = req.body.order_id
    
    Order.findOneAndUpdate(
        {
            _id: order_id,
            account: account_id
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

module.exports = comUserController;
