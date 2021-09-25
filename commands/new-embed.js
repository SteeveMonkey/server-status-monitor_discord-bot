const ServerUtils = require('../server-utils.js');
const { prefix } = require('../config.json');

module.exports = {
	name: 'new-embed',
	aliases: ['add-embed', 'create-embed'],
	description: 'Creates a new self-updating status message in the current channel',
	args: true,
	usage: '<embed id> <server type> <address> [port]',
	execute(message, args) {
		let embedId = null;
		const serverData = {
			type: null,

			address: null,
			port: null,
		};

		// Handle args
		if (args[0] == undefined) {
			message.channel.send(`You must provide a new embed identifier, the server ping type, and the server address, ${message.author}!\n`
			+ `The proper usage would be: \`${prefix}${this.name} ${this.usage}\``);
			return;
		}
		else {
			embedId = args[0];
		}

		if (args[1] == undefined) {
			message.channel.send(`You must provide the server ping type and address, ${message.author}!\n`
				+ `The proper usage would be: \`${prefix}${this.name} ${this.usage}\``);

			ServerUtils.displayPingTypes(message);

			return;
		}
		else {
			serverData.type = args[1].toLowerCase();
		}

		if (args[2] == undefined) {
			message.channel.send(`You must provide the server address, ${message.author}!`
			+ `The proper usage would be: \`${prefix}${this.name} ${this.usage}\``);
			return;
		}
		else {
			serverData.address = args[2];
		}

		if (args[3] !== undefined) {
			serverData.port = args[3];
		}

		// Create self-updating server status embed
		ServerUtils.createStatusEmbed(message, embedId, serverData);
	},
};