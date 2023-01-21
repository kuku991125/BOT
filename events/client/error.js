const { white, red } = require('chalk');

module.exports = async (client, error) => {
    console.log(white('[') + red('警告') + white('] ') + red('錯誤 ') + white(`${client.user.tag} (${client.user.id}) | ${error}`) + red(' '));
};
