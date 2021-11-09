const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-embed')
		.setDescription('Modifies a self-updating status message in the current channel')
		.addStringOption(option => option
			.setName('embed-id')
			.setDescription('Enter the ID of the status embed to modify')
			.setRequired(true))
		.addStringOption(option => option
			.setName('attribute')
			.setDescription('Enter the name of the attribute to modify')
			.setRequired(false))
		.addStringOption(option => option
			.setName('value')
			.setDescription('Enter the new value for the chosen attribute')
			.setRequired(false)),
	execute(interaction) {
		const options = interaction.options;

		// Handle args
		const embedId = options.getString('embed-id');
		const attributeId = options.getString('attribute');
		const newValue = options.getString('value');

		// Edit self-updating server status embed
		// TODO
	},
};