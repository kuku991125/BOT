const { PermissionsBitField, InteractionType, CommandInteraction } = require("discord.js");
const chalk = require('chalk');

/**
 * @param {CommandInteraction} interaction
 */

module.exports = async(client, interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
        if (!client.slash.has(interaction.commandName)) return;
        if (!interaction.guild) return;

        const command = client.slash.get(interaction.commandName);
        if(!command) return;

        /// Try to create new database went this member not have!
        await client.CreateAndUpdate(interaction.guild.id, interaction.user.id) /// Can find this module in Handlers/loadCreate.js
        await client.AuctionCreateAndUpdate(interaction.guild.id)
        await client.Roulette(interaction.guild.id)
        await client.Coinflip(interaction.guild.id)

        if (!client.dev.includes(interaction.user.id) && client.dev.length > 0) { 
            interaction.reply(`您不允許使用此命令。`)
            return;
        }

        console.log(chalk.magenta(`[命令] ${command.name} 使用 ${interaction.user.tag} 從 ${interaction.guild.name} (${interaction.guild.id})`));

        if(!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) return interaction.user.dmChannel.send(`我沒有發送消息的權限 ${interaction.guild.name}`);
        if(!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewChannel)) return;
        if(!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) return interaction.reply(`我沒有發送嵌入的權限${interaction.guild.name}`);
        if(!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply(`我沒有管理消息的權限 ${interaction.guild.name}`);


        try {
            command.run(interaction, client);
        } catch (error) {
            console.log(error)
            await interaction.reply({ content: `出現問題，稍後再試。`, ephmeral: true });
        }
    }
}