const Member = require('../../settings/models/member.js');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = { 
    name: "withdraw",
    description: "從您的銀行提取資金.",
    options: [
        {
            name: "數量",
            description: "您想提取的金額.",
            type: ApplicationCommandOptionType.String,
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

        if(args != parseInt(args) && args != "all") return interaction.editReply("請提供有效的金額或全部");

        const user = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

        if (args > user.bank) {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`您沒有足夠的錢來撤回這筆款項。`)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        if (args.toLowerCase() == 'all') { /// WITHDRAW ALL
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`你已經退出了 \`$${numberWithCommas(user.bank)}\` 來自您的銀行.`)
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });

            user.money += user.bank;
            user.bank = 0;
            
            await user.save();
        } else { /// DEPOSIT AMOUNT
            user.money += parseInt(args);
            user.bank -= parseInt(args);

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setDescription(`你已經退出了 \`$${numberWithCommas(args)}\` 來自您的銀行.`)
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });

            await user.save();
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}