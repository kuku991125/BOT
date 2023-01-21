const mongoose = require('mongoose');
const { MONGO_URI } = require('../settings/config.js');
const { white, green } = require('chalk');

module.exports = async () => {
    try {
        await mongoose.set('strictQuery', true);
        await mongoose.connect(MONGO_URI);
        console.log(white('[') + green('信息') + white('] ') + green('數據庫 ') + white('事件') + green('加載！'));
    } catch (error) {
        console.log(error);
    }
} 