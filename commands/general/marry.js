const { EmbedBuilder, MessageCollector, ApplicationCommandOptionType } = require("discord.js");
const Member = require("../../settings/models/member.js");

const pendings = {};

module.exports = { 
    name: "marriage",
    description: "結婚某人.",
    options: [
        {
            name: "邀請",
            description: "邀請某人嫁給你.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "用戶",
                    description: "您要結婚的用戶.",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: "離婚",
            description: "離婚您當前的伴侶。",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        if (interaction.options.getSubcommand() === "邀請") {
            const member = interaction.options.getUser("用戶");

            if (member.id === interaction.user.id) return interaction.editReply("你不能嫁給自己.");
            if (member.bot) return interaction.editReply("你不能嫁給機器人");

            /// Sent message went already sent
            for(const requester in pendings) {
                const receiver = pendings[requester];
                if (requester === interaction.user.id) { 
                    interaction.editReply("您已經有一個發送嫁給請求"); 
                    return;
                } else if (receiver === interaction.user.id) {
                    interaction.editReply("您已經有接收嫁給請求"); 
                    return;
                } else if (requester === member.id) {
                    interaction.editReply("該用戶已經有一個未決的結婚請求"); 
                    return;
                } else if (receiver === member.id) {
                    interaction.editReply("該用戶已經有接收嫁給請求"); 
                    return;
                }
            }

            /// Try to create new database went this member not have!
            await client.CreateAndUpdate(interaction.guild.id, member.id) /// Can find this module in Handlers/loadCreate.js

            //// This user already married
            const target = await Member.findOne({ guild_id: interaction.guild.id, user_id: member.id });
            if (target.married) {
                interaction.editReply("這個用戶已經結婚了");
                return;
            }

            //// Your already married
            const your = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });
            if (your.married) {
                interaction.editReply("你已經結婚了");
                return;
            }

            const embeded = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`您已將嫁給請求發送給\'${member.tag} \`\ n response：\'是\'.`)
                .setFooter({ text: `響應時間：30ms` })
                .setTimestamp();

            const Boxed = await interaction.editReply({ embeds: [embeded] });

            pendings[interaction.user.id] = member.id;
    
            const filter = (m) => m.author.id === member.id && (m.content.toLowerCase() === "是的" || m.content.toLowerCase() === "不");
            const collector = new MessageCollector(interaction.channel, { filter: filter, time: 30000 });
    
            collector.on('收藏', async (message) => {
                const content = message.content.toLowerCase();
                if (content === ('是的').toLocaleLowerCase()) {
                    /// Save marry
                    target.married = true; /// Set to true
                    target.married_to = interaction.user.id; /// Change target married to your id
                    await target.save();

                    your.married = true /// Set to true
                    your.married_to = member.id; /// Change your married to target id
                    await your.save().then( async () => {
                        const embed = new EmbedBuilder()
                            .setColor(client.color)
                            .setAuthor({ name: "嫁給接受", iconURL: interaction.user.avatarURL({ dynamic: true }) })
                            .setDescription(`\`${member.tag}\` *已經接受了您的嫁給請求*`)
                            .setThumbnail(member.avatarURL({ size: 512, dynamic: true }))
                            .setFooter({ text: `${interaction.user.username} <3 ${member.username}` })
                            .setTimestamp();
    
                        // Delete pending request
                        delete pendings[interaction.user.id];
                        await message.reply({ embeds: [embed] });
                        return collector.stop();
                    });
                } else if (content === ('不').toLocaleLowerCase()) {
    
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: "結婚拒絕了", iconURL: interaction.user.avatarURL({ dynamic: true }) })
                        .setDescription(`\`${member.tag}\` *已拒絕您的嫁給請求*`)
                        .setThumbnail(member.avatarURL({ size: 512, dynamic: true }))
                        .setFooter({ text: `被要求: ${interaction.user.tag}` })
                        .setTimestamp();
    
                    // Delete pending request
                    delete pendings[interaction.user.id];
                    await message.reply({ embeds: [embed] });
                    return collector.stop();
                }
            });
    
            collector.on('end', async (collected, reason) => {
                if(reason === "time") {
                    // Delete pending request
                    delete pendings[interaction.user.id];
                    await Boxed.edit({ content: "沒有反應.", embeds: [] })
                    return collector.stop();
                }
            });
        }
        if (interaction.options.getSubcommand() === "離婚") {
            const your = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });
            if (!your.married) return interaction.editReply("你沒有結婚.");

            const target = await Member.findOne({ guild_id: interaction.guild.id, user_id: your.married_to });
            const fetch = await client.users.fetch(your.married_to);

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: "離婚", iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`\`${interaction.user.tag}\` *離婚了* \`${client.users.cache.get(fetch.id).tag}\``)
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
                .setFooter({ text: `離婚: ${interaction.user.tag}` })
                .setTimestamp();

            await target.updateOne({ married: false, married_to: "" });
            await your.updateOne({ married: false, married_to: "" });
            await interaction.editReply({ embeds: [embed] });
        }
    }
}