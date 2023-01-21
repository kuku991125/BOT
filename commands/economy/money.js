const Member = require('../../settings/models/member.js');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = { 
    name: "money",
    description: "檢查您的錢或查看其他用戶的錢.",
    options: [
        {
            name: "用戶",
            description: "您要檢查的用戶。",
            type: ApplicationCommandOptionType.User,
            required: false,
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });
        const member = interaction.options.getUser("用戶")
        const mention = member ? member.id : interaction.user.id;

        const bot = member ? member.bot : interaction.user.bot;
        if (bot) return interaction.editReply("你不能檢查機器人錢");

        const avatarURL = member ? member.displayAvatarURL({ format: "png", size: 512 }) : interaction.user.displayAvatarURL({ format: "png", size: 512 });
        const userTag = member ? member.tag : interaction.user.tag;

        /// Try to create new database went this member not have!
        await client.CreateAndUpdate(interaction.guild.id, mention) /// Can find this module in Handlers/loadCreate.js

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: mention });

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: userTag, iconURL: avatarURL })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(`使用\`/排行榜\'命令查看您的排名。`)
            .addFields({ name: "硬幣:", value: `\`$${numberWithCommas(user.money)}\``, inline: true })
            .addFields({ name: "銀行:", value: `\`$${numberWithCommas(user.bank)}\``, inline: true })
            .addFields({ name: "全部的:", value: `\`$${numberWithCommas(user.money + user.bank)}\``, inline: true })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}