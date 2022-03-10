const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list-server-types')
		.setDescription('Lists all available server ping types and information about each'),
	execute(interaction) {
		let message = 'Here\'s a list of all my supported server ping types:';

		interaction.client.pingTypes.forEach(pingType => {
			message += `\n**${pingType.name}** \u2014 ${pingType.description}`;
		});

		interaction.reply({ content: message, ephemeral: true });
	},
};