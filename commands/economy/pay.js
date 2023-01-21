const Member = require('../../settings/models/member.js');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = { 
    name: "pay",
    description: "付錢給某人。",
    options: [
        {
            name: "數量",
            description: "您要支付的金額。",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "用戶",
            description: "您要支付的用戶。",
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });
        const args = interaction.options.getString("數量");

        const filters = [
            "+",
            "-"
        ];

        for (const message in filters) {
            if (args.includes(filters[message])) return interaction.editReply("你不能那樣做！");
        }

        if (args != parseInt(args) && args != "全部") return interaction.editReply("請提供有效的金額或全部");

        const member = interaction.options.getUser("用戶");
        if (member.id === interaction.user.id) return interaction.editReply("你不能付錢.");
        if (member.bot) return interaction.editReply("你不能支付機器人。");

        /// Try to create new database went this member not have!
        await client.CreateAndUpdate(interaction.guild.id, member.id) /// Can find this module in Handlers/loadCreate.js

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });
        const target = await Member.findOne({ guild_id: interaction.guild.id, user_id: member.id });

        if (args > user.money) {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`您沒有足夠的錢來支付這筆錢.`)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        if (user.money < -1) {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`你有負錢!`)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        if (args.toLowerCase() == '全部') { /// PAY ALL
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`你付錢\`$${numberWithCommas(user.money)}\` 到 ${member}.`)
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });
			
			target.money += user.money;
            user.money = 0;

            await target.save();
            await user.save();
        } else { /// PAY AMOUNT
            target.money += parseInt(args);
            user.money -= parseInt(args);

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`你付錢 \`$${numberWithCommas(args)}\` 到 ${member}.`)
                .setTimestamp();

			interaction.editReply({ embeds: [embed] });

            await target.save();
            await user.save();
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}