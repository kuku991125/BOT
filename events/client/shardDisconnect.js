const { yellow, white } = require("chalk");

module.exports = async (client, error, id) => {
    console.log(white('[') + yellow('警告') + white('] ') + yellow('碎片 ') + white(id) + yellow('碎片斷開連接！'));
}