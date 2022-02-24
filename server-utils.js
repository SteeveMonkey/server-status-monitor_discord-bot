const fs = require('fs');
const Discord = require('discord.js');
const LoopedList = require('./looped-list');

const embedDirectory = './embed-list';
const serverTypeDirectory = './ping_type';


// Returns file name of self-updating server status embed
function getEmbedFile(embedId, guildId, channelId) {
	return `${guildId}-${channelId}-${embedId}.json`;
}

// Returns path to attribute data for provided server ping type
function getServerDataAttributePath(serverType) {
	return `${serverTypeDirectory}/${serverType}-data.json`;
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

function updateEmbedMessage(client, embedFile) {
	return new Promise((resolve, reject) => {
		const embedPath = `${embedDirectory}/${embedFile}`;
		let embedData;
		try {
			embedData = JSON.parse(fs.readFileSync(embedPath));
		}
		catch (error) {
			reject(error);
		}

		const serverData = embedData.serverData;
		const server = client.pingTypes.get(serverData.type);

		server.ping(serverData).then(pingData => {
			const fileArray = [];
			const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

			statusEmbed.setTimestamp()
				.setFooter({ text: 'Last updated' });

			getEmbedMessage(client, embedData).then(message => {
				message.edit({ embeds: [statusEmbed] }).then(() => {
					resolve();
				}).catch(error => {
					reject(error);
				});
			}).catch(error => {
				if (error.code == 10008) {
					try {
						deleteEmbedEntry(client, embedFile);
					}
					catch (fsError) {
						reject(`Attempted to delete the status embed \`${embedFile}\` due to it's message no longer existing, but the operation failed: ${fsError}`);
					}
					reject(`The message from status embed \`${embedFile}\` no longer exists and it's corresponding entry has been removed`);
				}
				reject(error);
			});
		}).catch(error => {
			reject(error);
		});
	});
}

// Deletes the file and entry in pingList of the provided embed file name
function deleteEmbedEntry(client, embedFile) {
	const embedPath = `${embedDirectory}/${embedFile}`;

	client.pingList.remove(embedFile);
	fs.rmSync(embedPath);
}

class ServerUtils {

	// Return LoopedList of active embeds to regularly update
	static getPingList() {
		const pingList = new LoopedList();
		const embedFiles = fs.readdirSync(embedDirectory).filter(file => file.endsWith('.json'));

		for (const file of embedFiles) {
			pingList.add(file);
		}

		return pingList;
	}

	// Returns Discord Collection containing all of the pingTypes available
	static getPingTypes() {
		const pingTypes = new Discord.Collection();
		const serverTypeFiles = fs.readdirSync(serverTypeDirectory).filter(file => file.endsWith('.js'));

		for (const file of serverTypeFiles) {
			const serverType = require(`${serverTypeDirectory}/${file}`);
			pingTypes.set(serverType.value, serverType);
		}

		return pingTypes;
	}

	// Returns an object containing a Discord.MessageAttachment and it's internal reference URL from provided image URI
	static imageUriToAttachment(imageUri, imageName) {
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
			throw new Error('Expected an image URI for the first argument');
		}
	}

	// Passes server status as an embed message to the provided function
	static getStatusEmbed(client, serverData) {
		return new Promise((resolve, reject) => {
			const server = client.pingTypes.get(serverData.type);

			server.ping(serverData).then(pingData => {
				const fileArray = [];
				const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

				resolve(statusEmbed, fileArray);
			}).catch(error => {
				reject(error);
			});
		});
	}

	// Passes self-updating server status embed to provided function
	static createStatusEmbed(client, embedId, serverData, sendEmbed) {
		return new Promise((resolve, reject) => {
			const server = client.pingTypes.get(serverData.type);

			server.ping(serverData).then(pingData => {
				const fileArray = [];
				const statusEmbed = server.startEmbed(serverData, pingData, fileArray);
				serverData.icon = statusEmbed.thumbnail.url;

				statusEmbed.setTimestamp()
					.setFooter({ text: 'Last updated' });

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

					try {
						fs.writeFileSync(`${embedDirectory}/${embedFile}`, JSON.stringify(embedData));
					}
					catch (error) {
						reject(error);
					}
					client.pingList.add(embedFile);

					resolve();
				}).catch(error => {
					reject(error);
				});
			}).catch(error => {
				reject(error);
			});
		});
	}

	// Get embed data from the self-updating server status embed provided
	static getStatusEmbedData(embedId, guildId, channelId) {
		const embedFile = getEmbedFile(embedId, guildId, channelId);
		const embedPath = `${embedDirectory}/${embedFile}`;

		return JSON.parse(fs.readFileSync(embedPath));
	}

	// Get server attributes for given server ping type
	static getServerDataAttributes(serverType) {
		const serverDataPath = getServerDataAttributePath(serverType);

		return JSON.parse(fs.readFileSync(serverDataPath));
	}

	// Set embed data in self-updating server status embed
	static setStatusEmbedData(client, embedId, guildId, channelId, newEmbedData) {
		return new Promise((resolve, reject) => {
			const embedFile = getEmbedFile(embedId, guildId, channelId);
			const embedPath = `${embedDirectory}/${embedFile}`;

			try {
				fs.writeFileSync(embedPath, JSON.stringify(newEmbedData));
			}
			catch (error) {
				reject(error);
			}

			updateEmbedMessage(client, embedFile).then(() => {
				resolve(embedFile);
			}).catch(error => {
				reject(error, embedFile);
			});
		});
	}

	// Update information in self-updating server status embed
	static updateStatusEmbed(client, embedFile) {
		return new Promise((resolve, reject) => {
			updateEmbedMessage(client, embedFile).then(() => {
				resolve(`Successfully updated status embed \`${embedFile}\``);
			}).catch(error => {
				reject(error);
			});
		});
	}

	// Delete self-updating server status embed
	static deleteStatusEmbed(client, embedId, guildId, channelId) {
		return new Promise((resolve, reject) => {
			const embedFile = getEmbedFile(embedId, guildId, channelId);
			const embedPath = `${embedDirectory}/${embedFile}`;
			let embedData;

			// Check if entered embed ID is in use in this channel
			if (!this.isEmbedIdTaken(embedId, guildId, channelId)) {
				resolve(`Could not find the status message with the ID \`${embedId}\` within this channel`);
				return;
			}

			// Get data from embed entry
			try {
				embedData = JSON.parse(fs.readFileSync(embedPath));
			}
			catch (error) {
				reject(error);
				return;
			}

			// Delete message pointed to by embed data
			getEmbedMessage(client, embedData).then(message => {
				message.delete().then(() => {
					try {
						deleteEmbedEntry(client, embedFile);
					}
					catch (error) {
						reject(error);
						return;
					}
					resolve(`Successfully deleted the status message in this channel with the ID \`${embedId}\``);
				}).catch(error => {
					reject(error);
				});
			}).catch(error => {
				if (error.code == 10008) {
					try {
						deleteEmbedEntry(client, embedFile);
					}
					catch (error2) {
						reject(error2);
					}
					resolve(`The message for the status embed with the ID \`${embedId}\` no longer exists, however it's corresponding entry was successfully deleted`);
				}
				reject(error);
			});
		});
	}

	// Returns true if the provided ID matches an existing entry for a self-updating server status embed
	static isEmbedIdTaken(embedId, guildId, channelId) {
		return fs.existsSync(`${embedDirectory}/${getEmbedFile(embedId, guildId, channelId)}`);
	}
}

module.exports = ServerUtils;
