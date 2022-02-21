const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-embed')
		.setDescription('Modifies a single attribute of a self-updating status message in the current channel')
		.addStringOption(option => option
			.setName('embed-id')
			.setDescription('Enter the ID of the status embed to modify')
			.setRequired(true))
		.addStringOption(option => option
			.setName('attribute')
			.setDescription('Enter the name of the attribute to modify')
			.setRequired(true))
		.addStringOption(option => option
			.setName('value')
			.setDescription('Enter the new value for the chosen attribute')
			.setRequired(true)),
	execute(interaction) {
		const options = interaction.options;

		// Handle args
		const embedId = options.getString('embed-id');
		const attributeId = options.getString('attribute');
		const newValue = options.getString('value');

		const embedData = ServerUtils.getStatusEmbedData(embedId, interaction.guild.id, interaction.channel.id);
		const defaultEmbedData = ServerUtils.getDefaultStatusEmbedData(embedData.type);

		// Check if attribute id is valid
		if (attributeId in !defaultEmbedData) {
			// TODO: Report to user
			return;
		}

		// Edit self-updating server status embed
		// TODO
	},
};