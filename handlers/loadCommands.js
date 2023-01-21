const { white, green } = require("chalk");
const { readdirSync } = require('fs');

module.exports = async (client) => {
    readdirSync("./commands/").map(async dir => {
        const commands = readdirSync(`./commands/${dir}/`).map(async (cmd) => {
            const pull = require(`../commands/${dir}/${cmd}`)
            client.slash.set(pull.name, pull);
            if (pull.aliases) {
                pull.aliases.map(x => client.slash.set(x, pull));
            }
        });
    })
    console.log(white('[') + green('指令') + white('] ') + green('斜線') + white('事件') + green('加載！'));
}