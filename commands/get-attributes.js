const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-attributes')
		.setDescription('Shows the attributes for a status message in the current channel')
		.addStringOption(option => option
			.setName('embed-id')
			.setDescription('Enter the ID of the status embed to get the attributes from')
			.setRequired(true)),
	execute(interaction) {
		const options = interaction.options;

		// Handle args
		const embedId = options.getString('embed-id');

		// Run Command
		const serverData = ServerUtils.getStatusEmbedData(embedId, interaction.guild.id, interaction.channel.id).serverData;
		// const serverDataTemplate = ServerUtils.getServerDataTemplate(serverData.type);
		let messageContent = `Attributes for embed \`${embedId}\` in this channel:`;

		for (const attributeKey in serverData) {
			messageContent += `\n**${attributeKey}** \u2014 ${serverData[attributeKey]}`;
		}

		interaction.reply({ content: messageContent, ephemeral: true });
	},
};