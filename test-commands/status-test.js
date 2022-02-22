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

			showModpack: false,
			modpackName: 'Example modpack',
			modpackVersion: '1.0',
			modpackURL: 'http://example.com/',

			showAddress: true,
			version: '1.15.2',
			address: 'example.com',
			port: null,

			showBedrockAddress: true,
			bedrockVersion: '1.14.60',
			bedrockAddress: 'example.com',
			bedrockPort: null,

			mapURL: 'http://example.com/',
		};

		// Display status
		ServerUtils.getStatusEmbed(interaction.client, serverData, function(statusEmbed, fileArray) {
			interaction.reply({ embeds: [statusEmbed], files: fileArray, ephemeral: true });
		});
	},
};