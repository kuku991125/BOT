const Member = require('../../settings/models/member.js');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../settings/default.js");

module.exports = { 
    name: "rob",
    description: "搶錢一個人。成功的機會是5/10。",
    options: [
        {
            name: "用戶",
            description: "您要搶劫的用戶。",
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        const member = interaction.options.getUser("用戶");
        if (member.id === interaction.user.id) return interaction.editReply("你不能搶劫自己.");
        if (member.bot) return interaction.editReply("你不能搶劫機器人.");

        /// Try to create new database went this member not have!
        await client.CreateAndUpdate(interaction.guild.id, member.id) /// Can find this module in Handlers/loadCreate.js

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

        if (user && user.rob) {
            const cooldown = new Date(user.rob_cooldown);
            const time = new Date(cooldown - new Date());
            const time_format = `${time.getUTCHours()} 小時, ${time.getUTCMinutes()} 分鐘 ${time.getUTCSeconds()} 秒`;
    
            if(user.rob_cooldown > Date.now()) {
                return interaction.editReply(`你還不能搶劫，你必須等待 \`${time_format}\``);
            }

            const target = await Member.findOne({ guild_id: interaction.guild.id, user_id: member.id });
            if (!target) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    .setDescription(`${member} *沒有錢*`)
                    .setTimestamp();

                    interaction.editReply({ embeds: [embed] });
                return;
            }

            const chance = Math.floor(Math.random() * 100);
            if (chance > config.general.rob_chance) {
                const lostmoney = Math.floor(target.money / 2);

                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    .setDescription(`你成功搶劫了${member} 的 ${numberWithCommas(lostmoney)} 硬幣!`)
                    .setTimestamp();

                    interaction.editReply({ embeds: [embed] });

                user.money += lostmoney;
                user.rob_cooldown = Date.now() + (user.rob_cooldown_time * 1000);
                await user.save();

                target.money -= lostmoney;
                await target.save();
            } else {
                const lostmoney = Math.floor(user.money / 2);

                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    .setDescription(`你沒有搶劫 ${member}! 他們擺脫了 ${numberWithCommas(lostmoney)} coins!`)
                    .setTimestamp();

                    interaction.editReply({ embeds: [embed] });

                user.money -= lostmoney;
                user.rob_cooldown = Date.now() + (user.rob_cooldown_time * 1000);
                await user.save();
            }

        } else {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`您沒有允許Rob的許可.`)
                .setTimestamp();

                interaction.editReply({ embeds: [embed] });
            return;
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}