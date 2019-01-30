var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressSchema = new Schema({
	account: {
        type: Schema.ObjectId,
        ref: 'Account'
	},
	city: String,
	address: String,
    note: String,
	name: String,
	phone: String,
    longitude: Number,
    latitude: Number
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

module.exports = mongoose.model('Address', AddressSchema, 'address');