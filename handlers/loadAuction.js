const { white, green } = require("chalk");

module.exports = (client) => {
    require("./loadAuction/loadUpdate.js")(client);
    require("./loadAuction/loadContent.js")(client);
    console.log(white('[') + green('信息') + white('] ') + green('Darkauction') + white('事件') + green('加載！'));
};