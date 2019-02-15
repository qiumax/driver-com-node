var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
	userid: Number,
	username: String,
	// password: String,
	contact_name: String,
	contact_phone: String,
	name: String,
	address: String,
	province: String,
	city: String,
	license_number: String,
	license_image: String,
	price_dun: Number,
	price_fang: Number,
	price_peizai_notchao:Number,
	price_peizai_chao:Number,
	price_zhengche_notchao:Number,
	price_zhengche_chao:Number,
	state: Boolean,
	deleted: Boolean
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

/*
CompanySchema.methods.info = function () {
	return {
        name: this.name,
        address: this.address,
        province: this.province,
        city: this.city,
        license_number: this.license_number,
        license_image: this.license_image,
        price_dun: this.price_dun,
        price_fang: this.price_fang,
	}
}
*/

module.exports = mongoose.model('Company', CompanySchema, 'companys');