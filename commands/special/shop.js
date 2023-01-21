const Member = require("../../settings/models/member.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../settings/default.js");

module.exports = { 
    name: "shop",
    description: "用你的錢來生及技能AwA！",
    options: [
        {
            name: "list",
            description: "列出技能商店中的所有物品.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "buy",
            description: "從商店購買商品.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "技能",
                    description: "您想升級的技能.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        if (interaction.options.getSubcommand() === "buy") {
            const args = interaction.options.getString("技能");
            if(args != "work-speed" && args != "work-multiple" && args != "crime-speed" && args != "crime-multiple" && args != "rob-speed" && args != "rob") return interaction.editReply("Unknow item (Please type correct!)");

            const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });


            if (args.toLowerCase() == "work-speed") {
                if (user.work_cooldown_time < config.shop.max_work_cooldown_time) return interaction.editReply("您已經是最大減少工作冷卻的"); {
                    if (user.money < config.shop.work_reduce_cost) return interaction.editReply(`你需要 ${numberWithCommas(config.shop.work_reduce_cost)}硬幣要購買。`);

                    user.money -= config.shop.work_reduce_cost;
                    user.work_cooldown_time -= config.shop.reduce_work_cooldown;

                    await user.save();
                    interaction.editReply("您的工作冷卻已減少" + config.shop.reduce_work_cooldown + "工作冷卻："+ user.work_cooldown_time + " 秒.");
                }
            }

            if (args.toLowerCase() == "work-multiple") {
                // When have work multiple than work multiple max can't buy anymore!
                if (user.work_multiple > config.shop.work_multiple_max) return interaction.editReply("您已經是最大工作多重的"); {
                    if (user.money < config.shop.work_multiple_cost) return interaction.editReply(`你需要 ${numberWithCommas(config.shop.work_multiple_cost)}硬幣要購買。`);

                    user.money -= config.shop.work_multiple_cost;
                    user.work_multiple += config.shop.work_multiple;

                    await user.save();
                    interaction.editReply("您的工作錢是多重的 x" + config.shop.work_multiple + " 多種的： " + user.work_multiple);
                }
            }

            if (args.toLowerCase() == "crime-speed") {
                if (user.crime_cooldown_time < config.shop.max_crime_cooldown_time) return interaction.editReply("您已經是最大減少犯罪冷卻的"); {
                    if (user.money < config.shop.crime_reduce_cost) return interaction.editReply(`You need ${numberWithCommas(config.shop.crime_reduce_cost)} coins to buy.`);

                    user.money -= config.shop.crime_reduce_cost;
                    user.crime_cooldown_time -= config.shop.reduce_crime_cooldown;

                    await user.save();
                    interaction.editReply("您的犯罪冷卻 " + config.shop.reduce_crime_cooldown + "犯罪冷卻: " + user.crime_cooldown_time + "秒。");
                }
            }

            if (args.toLowerCase() == "crime-multiple") {
                if (user.crime_multiple > config.shop.crime_multiple_max) return interaction.editReply("你已經是最大犯罪了"); {
                    if (user.money < config.shop.crime_multiple_cost) return interaction.editReply(`你需要 ${numberWithCommas(config.shop.crime_multiple_cost)}硬幣要購買.`);

                    user.money -= config.shop.crime_multiple_cost;
                    user.crime_multiple += config.shop.crime_multiple;

                    await user.save();
                    interaction.editReply("您的犯罪資金是多重的 x" + config.shop.crime_multiple + "多種的: " + user.crime_multiple);
                }
            }

            if (args.toLowerCase() == "rob-speed") {
                if (user && user.rob) {
                    if (user.rob_cooldown_time < config.shop.max_rob_cooldown_time) return interaction.editReply("You are already max reduce rob cooldown"); {
                        if (user.money < config.shop.rob_reduce_cost) return interaction.editReply(`You need ${numberWithCommas(config.shop.rob_reduce_cost)} coins to buy.`);

                        user.money -= config.shop.rob_reduce_cost;
                        user.rob_cooldown_time -= config.shop.reduce_rob_cooldown;

                        await user.save();
                        interaction.editReply("您的Rob Cololdown已通過 " + config.shop.reduce_rob_cooldown + "第二。羅布·喬爾諾: " + user.rob_cooldown_time + "秒.");
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                        .setDescription(`您無權購買。`)
                        .setTimestamp();

                    interaction.editReply({ embeds: [embed] });
                    return;
                }
            }

            if (args.toLowerCase() == "rob") {
                if (user.money < config.shop.rob_cost) return interaction.editReply(`你需要 ${numberWithCommas(config.shop.rob_cost)} 硬幣要購買.`);

                user.money -= config.shop.rob_cost;
                user.rob = true;

                await user.save();
                interaction.editReply("你買了羅布。您現在可以搶劫人。");
            }
        }

        if (interaction.options.getSubcommand() === "list") {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`
                \`work-speed\` - ${numberWithCommas(config.shop.work_reduce_cost)} 硬幣 - 減少工作冷卻 ${config.shop.reduce_work_cooldown} seconds.
                \`work-multiple\` - ${numberWithCommas(config.shop.work_multiple_cost)} 硬幣 - 增加工作貨幣多重x${config.shop.work_multiple}.
                \`crime-speed\` - ${numberWithCommas(config.shop.crime_reduce_cost)} 硬幣 - 減少犯罪冷卻${config.shop.reduce_crime_cooldown} 秒.
                \`crime-multiple\` - ${numberWithCommas(config.shop.crime_multiple_cost)} 硬幣 - 增加犯罪貨幣多重 x${config.shop.crime_multiple}.
                \`rob\` - ${numberWithCommas(config.shop.rob_cost)} 硬幣 - 購買Rob。
                \`rob-speed\` - ${numberWithCommas(config.shop.rob_reduce_cost)} 硬幣 - 減少羅布冷卻 ${config.shop.reduce_rob_cooldown} 秒.
                `)
                .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}