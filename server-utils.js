const fs = require('fs');
const LoopedList = require('./looped-list');

const embedDirectory = './embed-list';


// Returns file name of self-updating server status embed
function getEmbedFile(embedId, guildId, channelId) {
	return `${guildId}-${channelId}-${embedId}.json`;
}

module.exports = {
	// Return LoopedList of active embeds to regularly update
	getPingList() {
		const pingList = new LoopedList();
		const embedFiles = fs.readdirSync(embedDirectory).filter(file => file.endsWith('.json'));

		for (const file of embedFiles) {
			pingList.add(file);
		}

		return pingList;
	},

	// Passes server status as an embed message to the provided function
	getStatusEmbed(client, serverData, EmbedCreated) {
		const server = client.pingTypes.get(serverData.type);

		server.ping(serverData, function(pingData) {
			const fileArray = [];
			const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

			EmbedCreated(statusEmbed, fileArray);
		});
	},

	// Passes self-updating server status embed to provided function
	createStatusEmbed(client, embedId, serverData, sendEmbed) {
		const server = client.pingTypes.get(serverData.type);

		return new Promise((resolve, reject) => {
			try {
				server.ping(serverData, function(pingData) {
					const fileArray = [];
					const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

					statusEmbed.setTimestamp()
						.setFooter('Last updated');

					sendEmbed(statusEmbed, fileArray).then(sentMessage => {
					// Save embed for later editing
						const embedFile = getEmbedFile(embedId, sentMessage.guild.id, sentMessage.channel.id);
						const embedData = {
							id: embedId,
							guildId: sentMessage.guild.id,
							channelId: sentMessage.channel.id,
							messageId: sentMessage.id,
							serverData: serverData,
						};

						fs.writeFileSync(`${embedDirectory}/${embedFile}`, JSON.stringify(embedData));

						client.pingList.add(embedFile);

						resolve();
					});
				});
			}
			catch(error) {
				reject(error);
			}
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
};
