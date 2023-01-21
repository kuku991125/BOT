const Member = require('../../settings/models/member.js');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = { 
    name: "deposit",
    description: "將錢存入您的銀行。",
    options: [
        {
            name: "數量",
            description: "您要存入的金額。",
            type: ApplicationCommandOptionType.String, /// 3 = String
            required: true,
        },
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });
        const args = interaction.options.getString("數量");

        const filters = [
            "+",
            "-"
        ];

        for (const message in filters) {
            if (args.includes(filters[message])) return interaction.editReply("你不能那樣做!");
        }
        
        if(args != parseInt(args) && args != "全部") return interaction.editReply("請提供有效的金額或全部");
        /// NEED AMOUNT AND ALL

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

        if (args > user.money) {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`您沒有足夠的錢來存入這筆款項。`)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        if (args.toLowerCase() == 'all') { /// DEPOSIT ALL
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`您已經存入了 \`$${numberWithCommas(user.money)}\` 進入您的銀行。`)
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });

            user.bank += user.money;
            user.money = 0;

            await user.save();
        } else { /// DEPOSIT AMOUNT
            user.bank += parseInt(args);
            user.money -= parseInt(args);

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`您已經存入了\`$${numberWithCommas(args)}\`進入您的銀行。`)
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });

            await user.save();
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}