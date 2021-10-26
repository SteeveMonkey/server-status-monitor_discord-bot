const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils.js');
const CommandUtils = require('../command-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-embed')
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
		embedId = options.getString('embed-id');
		if (ServerUtils.isEmbedIdTaken(embedId, interaction.guild.id, interaction.channel.id)) {
			interaction.reply({ content: `An embed with the ID \`${embedId}\` already exists in this channel.\nPlease try again with a different ID`, ephemeral: true });
			return;
		}
		serverData.type = options.getString('server-type');
		serverData.address = options.getString('address');
		if (options.getNumber('port') !== undefined) {
			serverData.port = options.getNumber('port');
		}

		// Create self-updating server status embed
		interaction.reply({ content: `Creating new self-updating status embed with the ID \`${embedId}\`...`, ephemeral: true });
		ServerUtils.createStatusEmbed(interaction.client, embedId, serverData, function sendEmbed(statusEmbed, fileArray) {
			return interaction.channel.send({ embeds: [statusEmbed], files: fileArray });
		}).then(() => {
			interaction.editReply({ content: `Successfully created new self-updating status embed with the ID \`${embedId}\``, ephemeral: true });
		}).catch(error => {
			interaction.editReply({ content: `Failed to create new status embed \`${embedId}\`:\n\`\`\`${error}\`\`\``, ephemeral: true });
		});
	},
};