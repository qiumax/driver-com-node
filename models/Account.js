var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Company = require("./Company");

var AccountSchema = new Schema({
	company: {
        type: Schema.ObjectId,
        ref: 'Company'
	},
	phone: String,
	name: String,
    employee_id: String,
    dep: String,
    position: String,
    
    addresses: [],
    default_address: {
        type: Schema.ObjectId,
        ref: 'Address'
    },
    
	state: Boolean,
	deleted: Boolean
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

module.exports = mongoose.model('Account', AccountSchema, 'accounts');