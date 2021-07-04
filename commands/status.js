const ServerUtils = require('../server-utils.js');

module.exports = {
	name: 'status',
	description: 'Displays the status of a server',
	args: true,
	usage: '<server type> <address> [port]',
	execute(message, args) {
		const serverData = {
			type: null,

			javaAddress: null,
			javaPort: null,
		};

		if (args[0] == undefined) {
			message.channel.send(`You must provide the server type, ${message.author}!`);

			ServerUtils.displayPingTypes(message);

			return;
		}
		else {
			serverData.type = args[0].toLowerCase();
		}

		if (args[1] == undefined) {
			message.channel.send(`You must provide the server address, ${message.author}!`);
		}
		else {
			serverData.javaAddress = args[1];
		}

		if (args[2] !== undefined) {
			serverData.javaPort = args[2];
		}

		ServerUtils.displayStatus(message, serverData);
	},
};