const Member = require("../../settings/models/member.js");
const { EmbedBuilder } = require("discord.js");
const config = require("../../settings/default.js");

module.exports = { 
    name: "crime",
    description: "賺錢的犯罪。被抓住的機會.",
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

        const cooldown = new Date(user.crime_cooldown);
        const time = new Date(cooldown - new Date());
        const time_format = `${time.getUTCHours()} 小時, ${time.getUTCMinutes()} 分鐘 ${time.getUTCSeconds()} 秒`;

        if(user.crime_cooldown > Date.now()) {
            return interaction.editReply(`你還不能犯罪，你必須等待 \`${time_format}\``);
        }

        /// Random 1500 - 3000
        const amount = Math.floor(Math.random() * (config.general.crime_money_min - config.general.crime_money_max)) + config.general.crime_money_max;
        /// + New Cooldown
        user.crime_cooldown = Date.now() + (user.crime_cooldown_time * 1000);

        const chance = Math.floor(Math.random() * 100);
        if (chance > config.general.crime_chance) {
            if (user.crime_multiple == 0) {
                user.money += amount;

                await user.save().then( async () => {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                        .setDescription(`${interaction.user} *賺了* \`$${numberWithCommas(amount)}\` *來自犯罪*`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .setFooter({ text: `冷卻: ${config.general.crime_cooldown_time} 秒` })

                return interaction.editReply({ embeds: [embed] });
                });
            } else {
                const formatBoost = amount * user.crime_multiple;

                user.money += formatBoost;

                await user.save().then( async () => {
                    const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    .setDescription(`${interaction.user} *賺了* \`$${numberWithCommas(amount)}\` *來自犯罪*`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setFooter({ text: `冷卻: ${user.crime_cooldown_time} 秒` })

                return interaction.editReply({ embeds: [embed] });
                });
            }
        } else {
            if (user.crime_multiple == 0) {
                user.money -= amount;

                await user.save().then( async () => {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                        .setDescription(`${interaction.user} *被抓了 * *失去了* \`$${numberWithCommas(amount)}\` *來自犯罪*`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .setFooter({ text: `冷卻: ${user.crime_cooldown_time} 秒` })

                    return interaction.editReply({ embeds: [embed] });
                });
            } else {
                const formatBoost = amount * user.crime_multiple;

                user.money -= formatBoost;

                await user.save().then( async () => {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                        .setDescription(`${interaction.user} *已被抓住**失去* \`$${numberWithCommas(formatBoost)}\` *來自犯罪*`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .setFooter({ text: `冷卻: ${config.general.crime_cooldown_time} 秒` })

                    return interaction.editReply({ embeds: [embed] });
                });
            }
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}