const mongoose = require('mongoose');
const { DB_URL } = require('../config/env');

module.exports = () => {
	mongoose.set('strictQuery', false);
	return mongoose.connect(DB_URL);
};