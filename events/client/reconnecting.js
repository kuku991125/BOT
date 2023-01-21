const { white, yellow } = require('chalk');

module.exports = async (client) => {
    console.log(white('[') + yellow('警告') + white('] ') + yellow('重新連接') + white(`${client.user.tag} (${client.user.id})`) + yellow(' '));
};
