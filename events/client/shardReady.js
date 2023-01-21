const { white, green } = require("chalk");

module.exports = async (client, id) => {
    console.log(white('[') + green('信息') + white('] ') + green('碎片') + white(id) + green('碎片準備好了！'));
}