const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils');

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
		const attributeId = options.getString('attribute');
		const newValue = options.getString('value');

		if (!ServerUtils.isEmbedIdTaken(embedId, interaction.guild.id, interaction.channel.id)) {
			interaction.reply({ content: `An embed with the ID \`${embedId}\` does not exist in this channel.\nPlease try again with a different ID`, ephemeral: true });
			return;
		}

		const embedData = ServerUtils.getStatusEmbedData(embedId, interaction.guild.id, interaction.channel.id);
		const serverDataAttributes = ServerUtils.getServerDataTemplate(embedData.serverData.type);


		// Check if attribute id is valid
		if (!(attributeId in serverDataAttributes)) {
			interaction.reply({ content: `Failed to change the attribute for the server status embed with the id \`${embedId}\` in this channel as the server ping type of \`${embedData.type}\` does not support using the attribute \`${attributeId}\``, ephemeral: true });
			return;
		}

		// Edit self-updating server status embed
		embedData.serverData[attributeId] = newValue;
		ServerUtils.setStatusEmbedData(interaction.client, embedId, interaction.guild.id, interaction.channel.id, embedData).then(embedFile => {
			interaction.reply({ content: `Succesfully set the attribute \`${attributeId}\` to \`${newValue}\` for the status embed with the id \`${embedId}\` in this channel`, ephemeral: true });
			console.log(`Successfully set new data in status embed \`${embedFile}\``);
		}).catch((error, embedFile) => {
			interaction.reply({ content: `Failed to change data of status embed \`${embedId}\`:\n\`\`\`${error}\`\`\``, ephemeral: true });
			console.error(`Failed to set new data in status embed \`${embedFile}\`:\n${error}`);
		});
	},
};