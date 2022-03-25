const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-embeds')
		.setDescription('Shows all of the status messages in the current channel'),
	async execute(interaction) {
		const embedList = ServerUtils.getEmbedsInChannel(interaction.guild.id, interaction.channel.id);
		let messageContent = 'Here is a list of all of the status embed messages in this channel:';

		for (const embed of embedList) {
			messageContent += `\n\n\`${embed[0]}\`` +
				`\n**Type** \u2014 ${embed[1].serverData.type}` +
				`\n**Address** \u2014 ${embed[1].serverData.address}` +
				`\n**Port** \u2014 ${embed[1].serverData.port}`;

			try {
				const message = await ServerUtils.getMessageFromChannel(interaction.channel, embed[1].messageId);
				messageContent += `\n${message.url}`;
			}
			catch (error) {
				console.error(error);
				messageContent += '\n```_Failed to obtain message URL_```';
				return;
			}
		}

		interaction.reply({ content: messageContent, ephemeral: true });
	},
};