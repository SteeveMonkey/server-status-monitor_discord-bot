const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils.js');
const CommandUtils = require('../command-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Displays the status of the given server')
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
		const serverData = {
			type: null,

			address: null,
			port: null,
		};

		// Handle options
		serverData.type = options.getString('server-type');
		serverData.address = options.getString('address');
		if (options.getNumber('port') !== undefined) {
			serverData.port = options.getNumber('port');
		}

		// Display status
		ServerUtils.getStatusEmbed(interaction.client, serverData).then((statusEmbed, fileArray) => {
			interaction.reply({ embeds: [statusEmbed], files: fileArray, ephemeral: true });
		}).catch(error => {
			interaction.reply({ content: `Failed to get status of server:\n\`\`\`${error}\`\`\``, ephemeral: true });
			console.error(`Failed to get status of provided \`${serverData.type}\` server:\n${error}`);
		});
	},
};