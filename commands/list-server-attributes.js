const { SlashCommandBuilder } = require('@discordjs/builders');
const CommandUtils = require('../command-utils');
const ServerUtils = require('../server-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list-server-attributes')
		.setDescription('Lists all available server ping types')
		.addStringOption(CommandUtils.getPingTypesOption(
			'server-type',
			'Enter the server type to obtain the attributes for',
			true)),
	execute(interaction) {
		const options = interaction.options;

		// Handle args
		const serverType = options.getString('server-type');

		// Get attributes
		const attributes = ServerUtils.getServerDataAttributes(serverType);

		// Create list
		let message = `Attributes for \`${interaction.client.pingTypes.get(serverType).name}\` servers:`;

		for (const attributeKey in attributes) {
			message += `\n\n**${attributeKey}** \u2014 ${attributes[attributeKey].description}`;
		}

		interaction.reply({ content: message, ephemeral: true });
	},
};