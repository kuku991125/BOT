const { white, red } = require('chalk');

module.exports = async (client, info) => {
    console.log(white(' [') + red('錯誤') + white('] ') + red('費率有限，睡覺') + white(0) + red('秒'));
}