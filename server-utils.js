const fs = require('fs');
const Discord = require('discord.js');
const LoopedList = require('./looped-list');

const embedDirectory = './embed-list';


// Returns file name of self-updating server status embed
function getEmbedFile(embedId, guildId, channelId) {
	return `${guildId}-${channelId}-${embedId}.json`;
}

// Returns promise containing status embed message obtained from provided embed data
function getEmbedMessage(client, embedData) {
	return new Promise((resolve, reject) => {
		client.guilds.fetch(embedData.guildId).then(guild => {
			guild.channels.fetch(embedData.channelId).then(channel => {
				channel.messages.fetch(embedData.messageId).then(message => {
					resolve(message);
				}).catch(error => {
					reject(error);
				});
			}).catch(error => {
				reject(error);
			});
		}).catch(error => {
			reject(error);
		});
	});
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

	// Returns an object containing a Discord.MessageAttachment and it's internal reference URL from provided image URI
	imageUriToAttachment(imageUri, imageName) {
		let uriSplit = imageUri.split(',');
		const data = uriSplit[1];
		uriSplit = uriSplit[0].split(';');
		const base = uriSplit[1];
		uriSplit = uriSplit[0].split('/');
		const imageFormat = uriSplit[1];

		if (uriSplit[0] == 'data:image') {
			return {
				attachment: new Discord.MessageAttachment(new Buffer.from(data, base), `${imageName}.${imageFormat}`),
				reference: `attachment://${imageName}.${imageFormat}`,
			};
		}
		else {
			throw new Error('Expected and image URI for the first argument');
		}
	},

	// Passes server status as an embed message to the provided function
	getStatusEmbed(client, serverData, EmbedCreated) {
		const server = client.pingTypes.get(serverData.type);

		server.ping(serverData).then(pingData => {
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
				server.ping(serverData).then(pingData => {
					const fileArray = [];
					const statusEmbed = server.startEmbed(serverData, pingData, fileArray);
					serverData.icon = statusEmbed.thumbnail.url;

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
	updateStatusEmbed(client, embedFile) {
		const embedData = JSON.parse(fs.readFileSync(`${embedDirectory}/${embedFile}`));
		const serverData = embedData.serverData;
		const server = client.pingTypes.get(serverData.type);

		return new Promise((resolve, reject) => {
			server.ping(serverData).then(pingData => {
				const fileArray = [];
				const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

				statusEmbed.setTimestamp()
					.setFooter('Last updated');

				getEmbedMessage(client, embedData).then(message => {
					message.edit({ embeds: [statusEmbed] }).then(() => {
						fs.writeFileSync(`${embedDirectory}/${embedFile}`, JSON.stringify(embedData));

						resolve();
					}).catch(error => {
						reject(error);
					});
				}).catch(error => {
					if (error.code == 10008) {
						reject(`Message from status embed \`${embedFile}\` no longer exists`);
					}
					reject(error);
				});
			}).catch(error => {
				reject(error);
			});
		});
	},

	// Delete self-updating server status embed
	deleteStatusEmbed(message) {
		message.delete();

		// TODO: Remove corresponding entry from ping list
	},
};
