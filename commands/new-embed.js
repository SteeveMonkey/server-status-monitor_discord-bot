const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils.js');
const CommandUtils = require('../command-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new-embed')
		.setDescription('Creates a new self-updating status message in the current channel')
		.addStringOption(option => option
			.setName('embed-id')
			.setDescription('Create an ID to reference this status embed later')
			.setRequired(true))
		.addStringOption(CommandUtils.getPingTypesOption(
			'server-type',
			'Enter the type of server to ping',
			true))
		.addStringOption(option => option
			.setName('address')
			.setDescription('Enter the address used to reach the server')
			.setRequired(true))
		.addNumberOption(option => option
			.setName('port')
			.setDescription('Enter the port used to reach the server')),
	execute(interaction) {
		const options = interaction.options;
		let embedId = null;
		const serverData = {
			type: null,

			address: null,
			port: null,
		};

		// Handle args
		// TODO: Check if provided embedId already exists before continuing
		embedId = options.getString('embed-id');
		serverData.type = options.getString('server-type');
		serverData.address = options.getString('address');
		if (options.getNumber('port') !== undefined) {
			serverData.port = options.getNumber('port');
		}

		// Create self-updating server status embed
		ServerUtils.createStatusEmbed(interaction, embedId, serverData);
	},
};