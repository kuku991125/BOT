const Member = require("../../settings/models/member.js");
const Ticket = require("../../settings/models/ticket.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../settings/default.js");

module.exports = { 
    name: "box",
    description: "箱子。",
    options: [
        {
            name: "x1",
            description: "打開x1",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "x10",
            description: "打開 x10",
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });
        const ticket = await Ticket.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

        const cooldown = new Date(ticket.gacha_cooldown);
        const time = new Date(cooldown - new Date());
        const time_format = `${time.getUTCHours()} 小時, ${time.getUTCMinutes()} 分鐘 ${time.getUTCSeconds()} 秒`;

        if(ticket.gacha_cooldown > Date.now()) {
            return interaction.editReply(`\n 你還不能打開，你必須等待 \`${time_format}\`\n`);
        }

        const six_stars = config.gacha.six_stars;
        const five_stars = config.gacha.five_stars;
        const four_stars = config.gacha.four_stars;
        const three_stars = config.gacha.three_stars;

        if (interaction.options.getSubcommand() === "x1") {
            
        if (user.money < config.gacha.gacha_price_one_round) return interaction.editReply(`你需要 ${numberWithCommas(config.gacha.gacha_price_one_round)} 硬幣才打開物品箱子X1。`);

        const store = [];

        if (ticket.guarantee_five_star >= config.gacha.guarantee_five_star) {
            const random = Math.floor(Math.random() * config.gacha.five_stars.length);
            store.push(
                `\`🌟\` **保證.** \`${five_stars[random]}\` \`⭐ ⭐ ⭐ ⭐ ⭐\`
                `);

            ticket.guarantee_six_star += 1;
            ticket.guarantee_five_star = 0;
            ticket.five_star_ticket += 1;
        } else if (ticket.guarantee_six_star >= config.gacha.guarantee_six_star)  {
            const random = Math.floor(Math.random() * config.gacha.six_stars.length);
            store.push(
                `\`🌟\` **保證.** \`${six_stars[random]}\` \`⭐ ⭐ ⭐ ⭐ ⭐ ⭐\`
                `);

            ticket.guarantee_six_star = 0;
            ticket.guarantee_five_star += 1;
            ticket.six_star_ticket += 1;
        }

        for (let i = 0; i < 1; i++) {
        const getNumber = roll()
        switch(getNumber[0]) {
            case 6:
                store.push(
                    `**${i + 1}.** \`${six_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐ ⭐ ⭐ ⭐\`
                    `);
                // Got 6 Stars = reset guarantee
                ticket.guarantee_six_star = 0;
                // Add +1 guarantee five star
                ticket.guarantee_five_star += 1;
                // Add Ticket 6 Star
                ticket.six_star_ticket += 1;
                break;
            case 5:
                store.push(
                    `**${i + 1}.** \`${five_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐ ⭐ ⭐\`
                    `);
                // Add +1 guarantee six star
                ticket.guarantee_six_star += 1;
                // Got 5 Star = reset guarantee
                ticket.guarantee_five_star = 0;
                // Add Ticket 5 Star
                ticket.five_star_ticket += 1;
                break;
            case 4:
                store.push(
                    `**${i + 1}.** \`${four_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐ ⭐\`
                    `);
                // Add +1 guarantee six star
                ticket.guarantee_six_star += 1;
                // Add +1 guarantee five star
                ticket.guarantee_five_star += 1;
                // Add Ticket 4 Star
                ticket.four_star_ticket += 1;
                break;
            case 3:
                store.push(
                    `**${i + 1}.** \`${three_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐\`
                    `);
                // Add +1 guarantee six star
                ticket.guarantee_six_star += 1;
                // Add +1 guarantee five star
                ticket.guarantee_five_star += 1;
                // Add Ticket 4 Star
                ticket.three_star_ticket += 1;
                break;
            }
        }

        const pages = [];
        for (let i = 0; i < 1; i++) {
        const str = store.slice(i * 3, i * 3 + 3).join("");

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: "你打開物品子x1", iconURL: interaction.user.avatarURL({ dynamic: true }) })
            .setDescription(str == "" ? " 沒有" : "\n" + str)
            .setFooter({ text: `• 保證5星 ${config.gacha.guarantee_five_star - ticket.guarantee_five_star} | 6星 ${config.gacha.guarantee_six_star - ticket.guarantee_six_star}` });

            pages.push(embed);
        }

        interaction.editReply({ embeds: [pages[0]] });

        ticket.gacha_cooldown = Date.now() + (ticket.gacha_cooldown_time * 1000);
        user.money -= config.gacha.gacha_price_one_round;

        await ticket.save();
        await user.save();
        }

        if (interaction.options.getSubcommand() === "x10") {

        if (user.money < config.gacha.gacha_price_ten_round) return interaction.editReply(`你需要${numberWithCommas(config.gacha.gacha_price_ten_round)}硬幣才能打開物品箱子x10.`);
        const store = [];

        if (ticket.guarantee_five_star >= config.gacha.guarantee_five_star) {
            const random = Math.floor(Math.random() * config.gacha.five_stars.length);
            store.push(
                `\`🌟\` **保證.** \`${five_stars[random]}\` \`⭐ ⭐ ⭐ ⭐ ⭐\`
                `);

            ticket.guarantee_six_star += 1;
            ticket.guarantee_five_star = 0;
            ticket.five_star_ticket += 1;
        } else if (ticket.guarantee_six_star >= config.gacha.guarantee_six_star)  {
            const random = Math.floor(Math.random() * config.gacha.six_stars.length);
            store.push(
                `\`🌟\` **保證。** \`${six_stars[random]}\` \`⭐ ⭐ ⭐ ⭐ ⭐ ⭐\`
                `);

            ticket.guarantee_six_star = 0;
            ticket.guarantee_five_star += 1;
            ticket.six_star_ticket += 1;
        }

        for (let i = 0; i < 10; i++) {
        const getNumber = roll()
        switch(getNumber[0]) {
            case 6:
                store.push(
                    `**${i + 1}.** \`${six_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐ ⭐ ⭐ ⭐\`
                    `);
                // Got 6 Stars = reset guarantee
                ticket.guarantee_six_star = 0;
                // Add +1 guarantee five star
                ticket.guarantee_five_star += 1;
                // Add Ticket 6 Star
                ticket.six_star_ticket += 1;
                break;
            case 5:
                store.push(
                    `**${i + 1}.** \`${five_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐ ⭐ ⭐\`
                    `);
                // Add +1 guarantee six star
                ticket.guarantee_six_star += 1;
                // Got 5 Star = reset guarantee
                ticket.guarantee_five_star = 0;
                // Add Ticket 5 Star
                ticket.five_star_ticket += 1;
                break;
            case 4:
                store.push(
                    `**${i + 1}.** \`${four_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐ ⭐\`
                    `);
                // Add +1 guarantee six star
                ticket.guarantee_six_star += 1;
                // Add +1 guarantee five star
                ticket.guarantee_five_star += 1;
                // Add Ticket 4 Star
                ticket.four_star_ticket += 1;
                break;
            case 3:
                store.push(
                    `**${i + 1}.** \`${three_stars[getNumber[1]]}\` \`⭐ ⭐ ⭐\`
                    `);
                // Add +1 guarantee six star
                ticket.guarantee_six_star += 1;
                // Add +1 guarantee five star
                ticket.guarantee_five_star += 1;
                // Add Ticket 4 Star
                ticket.three_star_ticket += 1;
                break;
            }
        }

        const pages = [];
        for (let i = 0; i < 1; i++) {
        const str = store.slice(i * 12, i * 12 + 12).join("");

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: "結果打開X10", iconURL: interaction.user.avatarURL({ dynamic: true }) })
            .setDescription(str == "" ? " 沒有" : "\n" + str)
            .setFooter({ text: `• 保證5星 ${config.gacha.guarantee_five_star - ticket.guarantee_five_star} | 6 Star ${config.gacha.guarantee_six_star - ticket.guarantee_six_star}` });

            pages.push(embed);
        }

        interaction.editReply({ embeds: [pages[0]] });

        ticket.gacha_cooldown = Date.now() + (ticket.gacha_cooldown_time * 1000);
        user.money -= config.gacha.gacha_price_ten_round;

        await ticket.save();
        await user.save();
    }

      //  const role = client.guilds.cache.get(interaction.guild.id).roles.cache.find(r => r.name === item);

      //  const alreadyHave = interaction.member.roles.cache.find(r => r.id === role.id);
      //  if(alreadyHave) return interaction.followUp("Dupicate item. you already have this item.");

      //  await interaction.member.roles.add(role);
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roll() {
    const number = (Math.floor(Math.random() * 1000) + 1) * 0.1
    if (number <= 0.5) {
    const random = Math.floor(Math.random() * config.gacha.six_stars.length)
        return [6, random]
    } else if(number <= 1) {
        const random = Math.floor(Math.random() * config.gacha.five_stars.length)
        return [5, random]
    } else if(number <= 20) {
        const random = Math.floor(Math.random() * config.gacha.four_stars.length)
        return [4, random]
    } else if(number <= 60) {
        const random = Math.floor(Math.random() * config.gacha.three_stars.length)
        return [3, random]
    } else if(number <= 100) {
        const random = Math.floor(Math.random() * config.gacha.three_stars.length)
        return [3, random]
    }
}