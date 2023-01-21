const { plsParseArgs } = require('plsargs');
const args = plsParseArgs(process.argv.slice(2));
const path = require("path");
const { TOKEN } = require("./settings/config.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');

(async () => {

        let deployed = args.get(0) == "guild" ? "guild" : args.get(0) == "global" ? "全球的" : args.get(0) == "clear" ? "clear" : args.get(0) == "clearglobal" ? "clearglobal" : null;

        if (!deployed) {
            console.error(`無效共享模式！有效模式：公會，全球，清晰，清晰清晰`);
            console.error(`用法示例：node deployslash.js guild <guildid>`);
            console.error(`用法示例：node deployslash.js global`);
            console.error(`用法示例：node deployslash.js clear <guildid>`);
            console.error(`用法示例：node deployslash.js clearglobal`);

        return process.exit(1);
        }

        const commands = [];

        readdirSync("./commands/").map(async dir => {
            readdirSync(`./commands/${dir}`).map(async (cmd) => {
                commands.push(require(path.join(__dirname, `./commands/${dir}/${cmd}`)));
            })
        })

        const rest = new REST({ version: "9" }).setToken(TOKEN);

        console.info("檢索帳戶信息！");
        /** @type {import("discord-api-types/rest/v9/user").RESTGetAPIUserResult} */

        const client = await rest.get(Routes.user());
        console.info(`收到的帳戶信息！ ${client.username}#${client.discriminator} (${client.id})`);

        console.info(`斜線（應用程序）部署在不和諧!`);

        switch (deployed) {
            case "公會": {
                let guildId = args.get(1);
                console.info(`共享模式：公會 (${guildId})`);

                await rest.put(Routes.applicationGuildCommands(client.id, guildId), { body: commands });

                console.info(`[部署]斜線命令可能需要3-5秒才能到達。`);
                break;
            }
            case "全球的": {
                console.info(`共享模式：全局`);

                await rest.put(Routes.applicationCommands(client.id), { body: commands });
    
                console.info(`[部署]斜線命令最多需要1小時才能到達。如果您希望它立即到達，則可以將機器人從服務器中扔進去並將其丟回去。`);
                break;
            }
            case "清除": {
                let guildId = args.get(1);
                console.info(`共享模式：清除 (${guildId})`);

                await rest.put(Routes.applicationGuildCommands(client.id, guildId), { body: [] });

                console.info(`[清算]斜線命令可能需要3-5秒才能到達.`);
                break;
            }
            case "清單": {
                console.info(`共享模式：清除全局`);

                await rest.put(Routes.applicationCommands(client.id), { body: [] });

                console.info(`[清算]斜線命令最多可能需要1小時才能到達。如果您希望它立即到達，則可以將機器人從服務器中扔出來並恢復.`);
                break;
            }
        }

        console.info(`部署的斜線（應用程序）`)
    })
();