const { white, yellow } = require("chalk");

module.exports = async (client, id) => {
    console.log(white('[') + yellow('警告') + white('] ') + yellow('碎片') + white(id) + yellow('碎片重新連接!'));
}