const fs = require('fs');
const { prefix } = require('./config.json');


// Returns path to self-updating server status embed
function getEmbedPath(message, embedId) {
	return `./guilds/${message.guild.id}/channels/${message.channel.id}/embeds/${embedId}.json`;
}

module.exports = {
	// Passes server status as an embed message to the provided function
	getStatusEmbed(client, serverData, EmbedCreated) {
		const server = client.pingTypes.get(serverData.type);

		server.ping(serverData, function(pingData) {
			const fileArray = [];
			const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

			EmbedCreated(statusEmbed, fileArray);
		});
	},

	// Create self-updating server status embed
	createStatusEmbed(message, embedId, serverData) {
		const server = message.client.pingTypes.get(serverData.type);

		server.ping(serverData, function(pingData) {
			const fileArray = [];
			const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

			statusEmbed.setTimestamp()
				.setFooter('Last updated');

			message.channel.send({ embeds: [statusEmbed], files: fileArray }).then(sentMessage => {
				// Save embed for later editing
				const embedPath = getEmbedPath(sentMessage, embedId);
				let embedData;

				if (fs.existsSync(embedPath)) {
					embedData = require(embedPath);
				}
				else {
					embedData = {};
				}

				embedData.id = embedId;
				embedData.messageId = sentMessage.id;
				embedData.data = serverData;

				fs.writeFileSync(embedPath, embedData);

				// TODO: Create entry in ping list
			});
		});
	},

	// Update information in self-updating server status embed
	updateStatusEmbed(message, serverData) {
		const server = message.client.pingTypes.get(serverData.type);

		server.ping(serverData, function(pingData) {
			const statusEmbed = server.startEmbed(serverData, pingData);

			statusEmbed.setTimestamp()
				.setFooter('Last updated');

			message.edit(statusEmbed);

			// TODO: Modify corresponding entry in ping list
		});
	},

	// Delete self-updating server status embed
	deleteStatusEmbed(message) {
		message.delete();

		// TODO: Remove corresponding entry from ping list
	},

	// Display list of supported server ping types in DMs
	displayPingTypes(message) {
		let reply = 'Here\'s a list of all my compatible server ping types:';
		message.client.pingTypes.forEach(serverType => {
			reply += `\n**${serverType.name}** \u2014 ${serverType.description}`;
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
