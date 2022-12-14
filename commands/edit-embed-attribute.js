const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils');
const CommandUtils = require('../command-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-embed-attribute')
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
		if (!ServerUtils.isEmbedIdTaken(embedId, interaction.guild.id, interaction.channel.id)) {
			interaction.reply({ content: `An embed with the ID \`${embedId}\` does not exist in this channel.\nPlease try again with a different ID`, ephemeral: true });
			return;
		}
		const embedData = ServerUtils.getStatusEmbedData(embedId, interaction.guild.id, interaction.channel.id);
		const serverDataAttributes = ServerUtils.getServerDataTemplate(embedData.serverData.type);

		const attributeId = options.getString('attribute');
		if (!(attributeId in serverDataAttributes)) {
			interaction.reply({ content: `Failed to change the attribute for the server status embed with the id \`${embedId}\` in this channel as the server ping type of \`${embedData.serverData.type}\` does not support using the attribute \`${attributeId}\``, ephemeral: true });
			return;
		}

		const newValue = ((attributeId == 'port') ?
			parseInt(options.getString('value')) :
			options.getString('value')
		);


		// Edit self-updating server status embed
		embedData.serverData[attributeId] = newValue;
		ServerUtils.setStatusEmbedData(embedId, interaction.guild.id, interaction.channel.id, embedData).then(embedFile => {
			const errorMessage = `I managed to set the attribute \`${attributeId}\` to \`${newValue}\` in the data for the status embed with the id \`${embedId}\`, but I was not able to edit the status embed to show the new data`;

			// Check for permissions required to update an embed message
			if (!CommandUtils.hasPermission(interaction, 'VIEW_CHANNEL') || !CommandUtils.hasPermission(interaction, 'READ_MESSAGE_HISTORY')) {
				interaction.reply({ content: `${errorMessage}. **This appears to be due to missing permissions, so please ensure that I have permission to view this channel and read it's message history**. Once these permissions are sorted out the new data will become visible on the next automatic update or edit`, ephemeral: true });
				return;
			}

			ServerUtils.updateStatusEmbed(interaction.client, embedFile).then(() => {
				console.log(`Successfully set new data in status embed \`${embedFile}\``);
				interaction.reply({ content: `Successfully set the attribute \`${attributeId}\` to \`${newValue}\` for the status embed with the id \`${embedId}\` in this channel`, ephemeral: true });
			}).catch(error => {
				interaction.reply({ content: `${errorMessage}:\n\`\`\`${error}\`\`\``, ephemeral: true });
				console.error(`Failed to update status embed \`${embedFile}\`:\n${error}`);
			});

		}).catch((error, embedFile) => {
			interaction.reply({ content: `Failed to change data of status embed \`${embedId}\`:\n\`\`\`${error}\`\`\``, ephemeral: true });
			console.error(`Failed to set new data in status embed \`${embedFile}\`:\n${error}`);
		});
	},
};