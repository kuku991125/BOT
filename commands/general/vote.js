const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const Member = require("../../settings/models/member.js");

module.exports = { 
    name: "vote",
    description: "投票給其他用戶.",
    options: [
        {
            name: "user",
            description: "您要投票的用戶.",
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        const member = interaction.options.getUser("user");
        if (member.bot) return interaction.editReply("你不能投票機器人");

        /// Try to create new database went this member not have!
        await client.CreateAndUpdate(interaction.guild.id, member.id) /// Can find this module in Handlers/loadCreate.js

        const interac = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: member.id });
        if(user.user_id === interaction.user.id) return interaction.editReply("你不能自己投票.");

        const cooldown = new Date(interac.vote_cooldown);
        /// Format time and send message
        const time = new Date(cooldown - new Date());
        const time_format = `${time.getUTCHours()} 小時, ${time.getUTCMinutes()} 分鐘  ${time.getUTCSeconds()} 秒`;

        if(interac.vote_cooldown > Date.now()) {
            return interaction.editReply(`你還不能投票，你必須等待\`${time_format}\``);
        }

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
            .setDescription(`\`${interaction.user.tag}\` 正在投票 \`${member.tag}\``)
            .setThumbnail(member.avatarURL({ dynamic: true }))
            .setFooter({ text: `投票: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })

        user.reputation += 1;
        await user.save();

        /// Get vote cooldown in database
        interac.vote_cooldown = Date.now() + (interac.vote_cooldown_time * 1000);
        await interac.save();

        return interaction.editReply({ embeds: [embed] });

    }
}