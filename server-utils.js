const { prefix } = require('../config.json');

module.exports = {
	// Display server status
	displayStatus(message, serverData) {
		const server = message.client.pingTypes.get(serverData.type)
			|| message.client.pingTypes.find(serverType => serverType.aliases && serverType.aliases.includes(serverData.type));

		server.ping(serverData, function(pingData) {
			const statusEmbed = server.startEmbed(serverData, pingData);

			message.channel.send(statusEmbed);
		});
	},

	// Create updatable server status embed
	createStatusEmbed(message, serverData) {
		const server = message.client.pingTypes.get(serverData.type)
			|| message.client.pingTypes.find(serverType => serverType.aliases && serverType.aliases.includes(serverData.type));

		server.ping(serverData, function(pingData) {
			const statusEmbed = server.startEmbed(serverData, pingData);

			statusEmbed.setTimestamp()
				.setFooter('Last updated');

			message.channel.send(statusEmbed);

			// TODO: Save message object for later editing
		});
	},

	// Update information in server status embed
	updateStatusEmbed(message, serverData) {
		const server = message.client.pingTypes.get(serverData.type)
			|| message.client.pingTypes.find(serverType => serverType.aliases && serverType.aliases.includes(serverData.type));

		server.ping(serverData, function(pingData) {
			const statusEmbed = server.startEmbed(serverData, pingData);

			statusEmbed.setTimestamp()
				.setFooter('Last updated');

			message.edit(statusEmbed);
		});
	},

	// Delete server status embed
	deleteStatusEmbed(message) {
		message.delete();
	},

	// Display list of supported server ping types in DMs
	displayPingTypes(message) {
		let reply = 'Here\'s a list of all my compatible server ping types:';
		message.client.pingTypes.forEach(serverType => {
			reply += `**${serverType.name}** \u2014 ${serverType.description}`;
		});
		reply += `\n\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`;

		message.author.send(reply)
			.then(() => {
				if (message.channel.type === 'dm') {
					return;
				}
				message.reply('I\'ve sent you a DM with all my supported server ping types.');
			})
			.catch((error) => {
				console.error(`Could not send server ping list DM to ${message.author.tag}.\n`, error);
				message.reply(`${message.author} It seems like I can't DM you! Do you have DMs disabled?`);
			});
	},
};
