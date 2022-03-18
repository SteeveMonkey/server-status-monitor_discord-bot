const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils.js');
const CommandUtils = require('../command-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete-embed')
		.setDescription('Deletes a self-updating status message from the current channel')
		.addStringOption(option => option
			.setName('embed-id')
			.setDescription('Enter the ID of the status embed to delete')
			.setRequired(true)),
	execute(interaction) {
		const options = interaction.options;

		// Handle args
		const embedId = options.getString('embed-id');

		// Check for permissions required to delete an embed message
		if (!CommandUtils.hasPermission(interaction, 'VIEW_CHANNEL')) {
			interaction.reply({ content: 'I do not seem to be able to access this channel\nPlease ensure I have permission to view this channel', ephemeral: true });
			return;
		}
		else if (!CommandUtils.hasPermission(interaction, 'READ_MESSAGE_HISTORY')) {
			interaction.reply({ content: 'I am unable to see the status embed in this channel\nPlease ensure I have permission to read message history in this channel', ephemeral: true });
			return;
		}

		// Delete self-updating server status embed
		ServerUtils.deleteStatusEmbed(interaction.client, embedId, interaction.guild.id, interaction.channel.id).then(messageContent => {
			interaction.reply({ content: messageContent, ephemeral: true });
		}).catch(error => {
			interaction.reply({ content: `Failed to delete status embed \`${embedId}\`:\n\`\`\`${error}\`\`\``, ephemeral: true });
			console.log(`Failed to delete status embed '${embedId}':`);
			console.error(error);
		});
	},
};