const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Clan = require("../../settings/models/clan.js");
const Member = require("../../settings/models/member.js");
const Auction = require("../../settings/models/auction.js");
const Ticket = require("../../settings/models/ticket.js");
const config = require("../../settings/default.js");

module.exports = { 
    name: "profile",
    description: "查看您的個人資料或其他用戶的個人資料.",
    options: [
        {
            name: "用戶",
            description: "您要檢查的用戶。",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        const member = interaction.options.getUser("用戶");

        const mention = member ? member.id : interaction.user.id;
        /// Can't check bots
        const bot = member ? member.bot : interaction.user.bot;
        if (bot) return interaction.editReply("您無法檢查機器人配置文件")

        const avatarURL = member ? member.displayAvatarURL({ format: "png", size: 512 }) : interaction.user.displayAvatarURL({ format: "png", size: 512 });
        const userTag = member ? member.tag : interaction.user.tag;
        const userUsername = member ? member.username : interaction.user.username;

        ///// NOT FINISHED ADD MORE SOON!

        /// Try to create new database went this member not have!
        await client.CreateAndUpdate(interaction.guild.id, mention) /// Can find this module in Handlers/loadCreate.js

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: mention });
        const clan = await Clan.findOne({ guild_id: interaction.guild.id, clan_members: mention });
        const auction = await Auction.findOne({ guild_id: interaction.guild.id, item_seller: mention }).countDocuments();

        const ticket = await Ticket.findOne({ guild_id: interaction.guild.id, user_id: mention });
        const TotalTickets = (ticket.common_ticket + ticket.uncommon_ticket) + (ticket.rare_ticket + ticket.epic_ticket) + (ticket.legendary_ticket + ticket.mythical_ticket);

        const randomtip = [
            "/social to setting social link!", 
            "/clan to view clan commands", 
            "/auction for auction", 
            "/work to get some money",
            "/gacha to get some tickets",
            "/roulette to play roulette",
            "/leaderboard to view your rank",
            "/profile to view profile",
            "/marry to marry someone",
        ];

        const tip = randomtip[Math.floor(Math.random() * randomtip.length)];

        if(user.married_to && !client.users.cache.get(user.married_to)){
            await client.users.fetch(user.married_to, true);
        }

        const Lover = !user.married_to ? "Not Married" : client.users.cache.get(user.married_to).tag;

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: userTag, iconURL: avatarURL })
            .setThumbnail(avatarURL)
            .setDescription(`使用\`/排行榜\'命令查看您的排名.`)
            .addFields({ name: "用戶名:", value: `\`${userUsername}\``, inline: true})
            .addFields({ name: "秩:", value: `\`${user.rank} 💠\``, inline: true})
            .addFields({ name: "結婚:", value: `\`💞 ${Lover}\``, inline: true})
            .addFields({ name: "名聲:", value: `\`${user.reputation} 💎 名聲\``, inline: true})
            .addFields({ name: "錢:", value: `\`$${numberWithCommas(user.money + user.bank)} 💰 硬幣\``, inline: true})
            .addFields({ name: "拍賣:", value: `\`${auction}/${config.auction.max_auction} 🛒 項目\``, inline: true})
            .addFields({ name: "票:", value: `\`${TotalTickets} 🎫 門票\``, inline: true})
            .setFooter({ text: `提示: ${tip}` })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });

    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}