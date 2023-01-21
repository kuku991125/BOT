const { white, yellow } = require('chalk');

module.exports = async (client) => {
    console.log(white('[') + yellow('警告') + white('] ') + yellow('斷開連接 ') + white(`${client.user.tag} (${client.user.id})`) + yellow(' '));
};
