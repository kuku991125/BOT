const { white, green } = require('chalk');

module.exports = async (client) => {

    console.log(white('[') + green('系統') + white('] ') + green(`${client.user.tag} (`) + white(` 準備好了！`) + white(`)`));

    let guilds = client.guilds.cache.size;
    let users = client.users.cache.size;
    let channels = client.channels.cache.size;

    const activities = [
        `/work | ${guilds} 服務器`,
        `/clan create <clan name> | ${users} users`,
        `/marry <target> | ${channels} channels`,
    ]

    setInterval(() => {
        client.user.setPresence({ 
         activities: [{ name: `${activities[Math.floor(Math.random() * activities.length)]}`, type: 2 }], 
         status: 'online', 
        });
    }, 15000)

};
