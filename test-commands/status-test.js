const { SlashCommandBuilder } = require('@discordjs/builders');
const ServerUtils = require('../server-utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status-test')
		.setDescription('Displays the status of a harcoded server'),
	execute(interaction) {
		const serverData = {
			type: 'minecraft',

			name: 'Test Server',
			description: 'Description for Server',
			website: 'http://example.com/',
			icon: 'http://ielts-results.weebly.com/uploads/4/0/6/6/40661105/1113084_orig.jpg',

			java: true,
			javaVersion: '1.15.2',
			javaAddress: 'example.com',
			// javaPort: '12022',

			bedrock: true,
			bedrockVersion: '1.14.60',
			bedrockAddress: 'example.com',
			// bedrockPort: '12010',

			mapURL: 'http://example.com/',
		};

		// Display status
		ServerUtils.getStatusEmbed(interaction.client, serverData, function(statusEmbed, fileArray) {
			interaction.reply({ embeds: [statusEmbed], files: fileArray, ephemeral: true });
		});
	},
};