const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils.js');

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

		// Delete self-updating server status embed
		ServerUtils.deleteStatusEmbed(interaction.client, embedId, interaction.guild.id, interaction.channel.id).then(messageContent => {
			interaction.reply({ content: messageContent, ephemeral: true });
		}).catch(error => {
			console.log(`The delete-embed command encountered an error: ${error}`);
		});
	},
};