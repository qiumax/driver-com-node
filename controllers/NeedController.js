var Need = require("../models/Need");
var Order = require("../models/Order");
var Truck = require("../models/Truck");
var NeedSchedule = require("../models/NeedSchedule")
var Account = require("../models/Account");
var Config = require("../config/Config")
var geolib = require("geolib");
var Constant = require("../config/Constant");

var needController = {};

needController.getPrice = function (req,res) {
	var account_id = req.session.account_id
	var body = req.body
	var price_type = body.price_type
	var chaoxian_type = body.chaoxian_type
	var price
	Account.findById(account_id).populate('company').then(account=>{
		console.log(account)
		price = account.company.price_dun
		if(price_type=="mass") {
			price = account.company.price_dun
		}
		if(price_type == 'zhengche' && chaoxian_type == '0'){
			price = account.company.price_zhengche_notchao
		}
		if(price_type == 'zhengche' && chaoxian_type == '1'){
			price = account.company.price_zhengche_chao
		}
		if(price_type == 'peizai' && chaoxian_type == '0')
		{
			price = account.company.price_peizai_notchao
		}
		if(price_type == 'peizai' && chaoxian_type == '1')
		{
			price = account.company.price_peizai_chao
		}
		res.send({price:price})

	})
}

needController.getNeedPrice = function (req, res) {
    var account_id = req.session.account_id
    
    var body = req.body
    var price_type = body.price_type
	var chaoxian_type = body.chaoxian_type
	var distance = body.distance

    
    var price
    Account.findById(account_id, 'company').populate('company').then(account=>{
        //console.log(account);
        
        if(price_type=="mass") {
            price = account.company.price_dun * body.mass * distance
        }
	    if(price_type == 'zhengche' && chaoxian_type == '0'){
		    price = account.company.price_zhengche_notchao * body.mass * distance
	    }
	    if(price_type == 'zhengche' && chaoxian_type == '1'){
		    price = account.company.price_zhengche_chao * body.mass * distance
	    }
	    if(price_type == 'peizai' && chaoxian_type == '0')
	    {
		    price = account.company.price_peizai_notchao * body.mass * distance
	    }
	    if(price_type == 'peizai' && chaoxian_type == '1')
	    {
		    price = account.company.price_peizaichao * body.mass * distance
	    }
		console.log(price)
        res.send({
            price: price,
        })
    })
}
needController.getTruck = function (req, res) {
	Truck.find({deleted:false}).then(truck => {
		res.send({truck:truck})
	})
}

needController.publishNeed = function (req, res) {
    var user_id = req.body.user_id
    var account_id = req.session.account_id
    var body = req.body
    
    console.log(req.session)
    
    var need = new Need({
        truck: body.truck_id,
        com_user: user_id,
        account: account_id,
        from: JSON.parse(body.from),
        to: JSON.parse(body.to),
        time: body.time,
	    arrive_time: body.arrive_time,
	    youka: body.youka,
	    peizai:body.peizai,
	    chaoxian:body.chaoxian,
        cargo: body.cargo,
        price_type: body.price_type,
        mass: body.mass,
	    distance: body.distance,
        volume: body.volume,
        price: body.price,
	    size: body.size,
	    truck_type: body.truck_type,
	    remark: body.remark,
        closed: false
    })
    
    need.save(function (err) {
		if(err) throw err

		var needSchedule = new NeedSchedule({
			need: need._id,
			run_now: false,
			run_time: new Date().getTime()/1000 + Config.need.schedule_time,
			finished: false
		})

		needSchedule.save(function (err) {
			if(err) throw err
			need.need_schedule = needSchedule._id
			need.save(function (err) {
				if(err) throw err
				res.send(need)
			})
		})
	})
}


//企业需跟进
needController.getNeedsFollowup=function (req,res) {
	var account_id = req.session.account_id

	console.log(account_id)

	Need.find({
		account: account_id,
		closed:false
	}).exec(function (err, need) {
		//找未完成order
		Order.find({
			account: account_id,
            $and: [ { state: { $ne: Constant.ORDER_STATE.COMMENTED } }, { state: { $ne:Constant.ORDER_STATE.PLAT_HANDLE_TOUSU} } ]
		}).sort({'time':1}).populate({
			path: 'driver',
			model: 'Driver',
			populate: {
				path: 'user',
				model: 'User'
			}
		}).exec(function (err, order) {
			if(order){
				for(var i=0;i<order.length;i++){
					need.push(order[i])
				}
			}
			res.send({need:need})
		})
	})

}
module.exports = needController;
