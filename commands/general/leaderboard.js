const Member = require('../../settings/models/member.js');
const Ticket = require('../../settings/models/ticket.js');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { LeadPage } = require("../../structures/Pagination.js");

module.exports = { 
    name: "leaderboard",
    description: "用排行榜查看最高金錢.",
    options: [
        {
            name: "錢",
            description: "用排行榜查看最高金錢.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "頁",
                    description: "您要獲取有關信息的頁面.",
                    type: ApplicationCommandOptionType.Integer, /// 4 = Integer
                    required: false
                }
            ]
        },
        {
            name: "票",
            description: "使用排行榜查看頂級門票.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "頁",
                    description: "您要獲取有關信息的頁面.",
                    type: ApplicationCommandOptionType.Integer, /// 4 = Integer
                    required: false
                }
            ]
        },
        {
            name: "名聲",
            description: "在排行榜上查看最高聲譽。",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "頁",
                    description: "您要獲取有關信息的頁面.",
                    type: ApplicationCommandOptionType.Integer, /// 4 = Integer
                    required: false
                }
            ]
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        if (interaction.options.getSubcommand() === "錢") {
            const args = interaction.options.getInteger("page");
            const user = await Member.find({ guild_id: interaction.guild.id });
        
            let pagesNum = Math.ceil(user.length / 10);
            if(pagesNum === 0) pagesNum = 1;

            /// Sort by Money
            user.sort((a, b) => {
                return b.money + b.bank - (a.money + a.bank);
            });

            const userStrings = [];
            for (let i = 0; i < user.length; i++) {
                const e = user[i];
                const fetch = await client.users.fetch(e.user_id);
                userStrings.push(
                    `**${i + 1}.** ${client.users.cache.get(fetch.id)} \`$${numberWithCommas(e.money + e.bank)} 💰 Coins\`
                    `);
            }

            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = userStrings.slice(i * 10, i * 10 + 10).join('');

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `最高金錢`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setColor(client.color)
                    .setDescription(`${str == '' ? '  沒有用戶' : '\n' + str}`)
                    .setFooter({ text: `頁 • ${i + 1}/${pagesNum} | ${user.length} • 總成員`});

                pages.push(embed);
            }

            if (!args) {
                if (pages.length == pagesNum && user.length > 10) LeadPage(client, interaction, pages, 120000, user.length);
                else return interaction.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(args)) return interaction.editReply('頁面必須是一個數字.');
                if (args > pagesNum) return interaction.editReply(`只有 ${pagesNum} 可用的頁面。`);
                const pageNum = args == 0 ? 1 : args - 1;
                return interaction.editReply({ embeds: [pages[pageNum]] });
            }
        }

        if (interaction.options.getSubcommand() === "票") {
            const args = interaction.options.getInteger("頁");
            const user = await Ticket.find({ guild_id: interaction.guild.id });
        
            let pagesNum = Math.ceil(user.length / 10);
            if(pagesNum === 0) pagesNum = 1;

            /// Sort by Total Tickets
            user.sort((a, b) => {
                return (b.three_star_ticket + b.four_star_ticket) + (b.five_star_ticket + b.six_star_ticket) -  (a.three_star_ticket + a.four_star_ticket) + (a.five_star_ticket + a.six_star_ticket);
            });

            const userStrings = [];
            for (let i = 0; i < user.length; i++) {
                const e = user[i];
                const TotalTicket =  (e.three_star_ticket + e.four_star_ticket) + (e.five_star_ticket + e.six_star_ticket);
                const fetch = await client.users.fetch(e.user_id);
                userStrings.push(
                    `**${i + 1}.** ${client.users.cache.get(fetch.id)} \`${TotalTicket} 🎫 門票\`
                    `);
            }

            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = userStrings.slice(i * 10, i * 10 + 10).join('');

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `頂級門票`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setColor(client.color)
                    .setDescription(`${str == '' ? '  沒有用戶' : '\n' + str}`)
                    .setFooter({ text: `頁 • ${i + 1}/${pagesNum} | ${user.length} • 總成員`});

                pages.push(embed);
            }

            if (!args) {
                if (pages.length == pagesNum && user.length > 10) LeadPage(client, interaction, pages, 120000, user.length);
                else return interaction.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(args)) return interaction.editReply('頁面必須是一個數字.');
                if (args > pagesNum) return interaction.editReply(`只有${pagesNum}頁面可用。`);
                const pageNum = args == 0 ? 1 : args - 1;
                return interaction.editReply({ embeds: [pages[pageNum]] });
            }
        }

        if (interaction.options.getSubcommand() === "名聲") {
            const args = interaction.options.getInteger("頁");
            const user = await Member.find({ guild_id: interaction.guild.id });
        
            let pagesNum = Math.ceil(user.length / 10);
            if(pagesNum === 0) pagesNum = 1;

            /// Sort by Reputation
            user.sort((a, b) => {
                return b.reputation - a.reputation;
            });

            const userStrings = [];
            for (let i = 0; i < user.length; i++) {
                const e = user[i];
                const fetch = await client.users.fetch(e.user_id);
                userStrings.push(
                    `**${i + 1}.** ${client.users.cache.get(fetch.id)} \`${e.reputation} 💎 名聲\`
                    `);
            }

            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = userStrings.slice(i * 10, i * 10 + 10).join('');

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `最高聲譽`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setColor(client.color)
                    .setDescription(`${str == '' ? '  沒有用戶' : '\n' + str}`)
                    .setFooter({ text: `頁 • ${i + 1}/${pagesNum} | ${user.length} • 總成員`});

                pages.push(embed);
            }

            if (!args) {
                if (pages.length == pagesNum && user.length > 10) LeadPage(client, interaction, pages, 120000, user.length);
                else return interaction.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(args)) return interaction.editReply('頁面必須是一個數字.');
                if (args > pagesNum) return interaction.editReply(`只有${pagesnum}頁面可用.`);
                const pageNum = args == 0 ? 1 : args - 1;
                return interaction.editReply({ embeds: [pages[pageNum]] });
            }
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}