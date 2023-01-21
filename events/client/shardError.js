const { red, white } = require("chalk");

module.exports = async (client, error, id) => {
    console.log(white('[') + red('錯誤') + white('] ') + red('碎片') + white(id) + red('碎片錯誤！'));
}