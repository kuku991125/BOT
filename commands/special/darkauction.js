const DarkAuction = require("../../settings/models/darkauction.js");
const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");
const config = require("../../settings/default.js");

module.exports = { 
    name: "darkauction",
    description: "黑暗拍賣.",
    options: [
        {
            name: "開始",
            description: "開始黑暗。",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "角色",
                    description: "您想拍賣的角色.",
                    type: ApplicationCommandOptionType.Role, /// 8 = Role
                    required: true
                },
                {
                    name: "價格",
                    description: "您想拍賣的價格。",
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                },
            ]
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        if (!interaction.member.permissions.has('管理公會')) return interaction.editReply(`您需要\`管理服務器\`來使用此命令。`);

        if (interaction.options.getSubcommand() === "開始") {

                const role = interaction.options.getRole("角色");
                const price = interaction.options.getInteger("價格");

                const auction = await DarkAuction.findOne({ guild_id: interaction.guild.id });
                if (auction.enabled === true) {
                    interaction.editReply("Darkauction已經在運行.");
                    return;
                }

                const MessageStart = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({ name: `黑暗拍賣`, iconURL: client.user.avatarURL({ format: "png", dynamic: true, size: 512 }) })
                    .setDescription(`
                    **角色:** ${role.name}
                    **開始出價:** $${numberWithCommas(price * config.dark_auction.multiple)} 硬幣
                    **投標人:** 還沒有出價.
                    `)
                    .setFooter({ text: `Time remaining: 120 seconds` });

                await interaction.guild.channels.create({
                    name: "黑暗拍賣",
                    type: 0, 
                    topic: `黑暗拍賣：出售 ${role.name} 為了 $${numberWithCommas(price * config.dark_auction.multiple)} 硬幣`,
                    parent: interaction.channel.parentId,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone,
                            allow: ['查看頻道', '發送信息', '複習史'],
                        }
                    ]
                }).then(async (channel) => {
                    await channel.send({ embeds: [MessageStart] }).then(async (message) => {
                        await DarkAuction.findOneAndUpdate({ guild_id: interaction.guild.id }, {
                            guild_id: interaction.guild.id,
                            enabled: true,
                            channel_id: channel.id,
                            message_id: message.id,
                            item: role.name,
                            price: price,
                            old_price: price,
                            bidder: "",
                            ended: true,
                            history: [],
                        }, { upsert: true });

                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: `黑暗拍賣`, iconURL: client.user.avatarURL({ format: "png", dynamic: true, size: 512 }) })
                        .setDescription(`
                        **角色:** ${role.name}
                        **價格:** $${numberWithCommas(price * config.dark_auction.multiple)} 硬幣
                        `)
                        .setThumbnail(client.user.displayAvatarURL())
                        .setFooter({ text: `開始 ${interaction.user.tag}`, icon_url: interaction.user.displayAvatarURL() });
        
                    return interaction.editReply({ embeds: [embed] });
                });
            });
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}