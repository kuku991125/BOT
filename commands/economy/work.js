const Member = require("../../settings/models/member.js");
const { EmbedBuilder } = require("discord.js");
const config = require("../../settings/default.js");

module.exports = { 
    name: "work",
    description: "工作以賺錢。",
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

        const cooldown = new Date(user.work_cooldown);
        const time = new Date(cooldown - new Date());
        const time_format = `${time.getUTCHours()} 小時, ${time.getUTCMinutes()} 分鐘 ${time.getUTCSeconds()} 秒`;

        if(user.work_cooldown > Date.now()) {
            return interaction.editReply(`你還不能工作，你必須等待 \`${time_format}\``);
        }

        const amount = Math.floor(Math.random() * (config.general.work_money_min - config.general.work_money_max)) + config.general.work_money_max;

        user.work_cooldown = Date.now() + (user.work_cooldown_time * 1000);

        /// Work Multiple Boost
        if(user.work_multiple == 0) {
            // Get default amount
            user.money += amount;
            /// Save database
            await user.save().then( async () => {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    .setDescription(`${interaction.user} *賺了* \`$${numberWithCommas(amount)}\` *從工作*`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setFooter({ text: `冷卻: ${user.work_cooldown_time} 秒` })

            return interaction.editReply({ embeds: [embed] });
            });
        } else {
            const formatBoost = amount * user.work_multiple;
            // Get boost amount
            user.money += formatBoost;
            /// Save database
            await user.save().then( async () => {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    .setDescription(`${interaction.user} *賺了* \`$${numberWithCommas(formatBoost)}\` *從工作*`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setFooter({ text: `冷卻: ${user.work_cooldown_time} 秒` })

            return interaction.editReply({ embeds: [embed] });
            });
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}