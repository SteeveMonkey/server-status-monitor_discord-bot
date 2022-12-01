const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-embed')
		.setDescription('Initiates GUI for modifying a self-updating status message in the current channel')
		.addStringOption(option => option
			.setName('embed-id')
			.setDescription('Enter the ID of the status embed to modify')
			.setRequired(true)),
	execute(interaction) {
		const options = interaction.options;

		// Handle args
		const embedId = options.getString('embed-id');

		// Run command
		const embedData = ServerUtils.getStatusEmbedData(embedId, interaction.guild.id, interaction.channel.id);

		// TODO: Present user with embed editor


		interaction.reply({ content: 'WIP', ephemeral: true });
	},
};