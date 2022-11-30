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

		// Handle args
		const embedId = options.getString('embed-id');
		if (ServerUtils.isEmbedIdTaken(embedId, interaction.guild.id, interaction.channel.id)) {
			interaction.reply({ content: `An embed with the ID \`${embedId}\` already exists in this channel.\nPlease try again with a different ID`, ephemeral: true });
			return;
		}

		const serverType = options.getString('server-type');

		const serverData = {
			type: serverType,
			...ServerUtils.getDefaultServerData(serverType),
		};

		serverData.address = options.getString('address');
		if (options.getNumber('port') !== undefined) {
			serverData.port = options.getNumber('port');
		}

		// Check for permissions required to send an embed message
		if (!CommandUtils.hasPermission(interaction, 'VIEW_CHANNEL')) {
			interaction.reply({ content: 'I do not seem to be able to access this channel\nPlease ensure I have permission to view this channel', ephemeral: true });
			return;
		}
		else if (!CommandUtils.hasPermission(interaction, 'SEND_MESSAGES')) {
			interaction.reply({ content: 'I am unable to send a message in this channel\nPlease ensure I have permission to send messages in this channel', ephemeral: true });
			return;
		}
		else if (!CommandUtils.hasPermission(interaction, 'EMBED_LINKS')) {
			interaction.reply({ content: 'I am unable to send an embed message in this channel\nPlease ensure I have permission to embed links in this channel', ephemeral: true });
			return;
		}
		else if (!CommandUtils.hasPermission(interaction, 'ATTACH_FILES')) {
			interaction.reply({ content: 'I am unable to send an image in this channel\nPlease ensure I have permission to attach files in this channel', ephemeral: true });
			return;
		}

		// Create self-updating server status embed
		interaction.reply({ content: `Creating new self-updating status embed with the ID \`${embedId}\`...`, ephemeral: true }).then(() => {
			ServerUtils.createStatusEmbed(interaction.client, embedId, serverData, function sendEmbed(statusEmbed, fileArray) {
				return interaction.channel.send({ embeds: [statusEmbed], files: fileArray });
			}).then(() => {
				if (CommandUtils.hasPermission(interaction, 'READ_MESSAGE_HISTORY')) {
					interaction.editReply({ content: `Successfully created new self-updating status embed with the ID \`${embedId}\``, ephemeral: true });
				}
				else {
					interaction.editReply({ content: `I was able to successfully create the new self-updating status embed with the ID \`${embedId}\`, but I seem to be unable to access it\n**Please ensure I have permission to read message history in this channel, or I will not be able to keep the server status embeds in this channel up to date**` });
				}
			}).catch(error => {
				interaction.editReply({ content: `Failed to create new status embed \`${embedId}\`:\n\`\`\`${error}\`\`\``, ephemeral: true });
				console.log(`Failed to create new status embed '${embedId}':`);
				console.error(error);
			});
		}).catch(error => {
			console.error(error);
		});
	},
};