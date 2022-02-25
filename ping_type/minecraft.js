const Discord = require('discord.js');
const ServerUtils = require('../server-utils');
const https = require('https');

module.exports = {
	value: 'minecraft',
	name: 'Minecraft',
	description: 'Used for Minecraft Java Edition servers. Can display Bedrock connection info for servers that also accept Bedrock clients',

	ping(serverData) {
		return new Promise((resolve, reject) => {
			try {
				let path = `/server/status?ip=${serverData.address}`;
				if (serverData.port) {
					path += `&port=${serverData.port}`;
				}

				const pingOptions = {
					'method': 'GET',
					'hostname': 'mcapi.us',
					'port': null,
					'path': path,
					'headers': {},
				};

				const pingRequest = https.request(pingOptions, function(pingResponse) {
					const chunks = [];

					pingResponse.on('data', function(chunk) {
						chunks.push(chunk);
					});

					pingResponse.on('end', function() {
						try {
							const buffer = Buffer.concat(chunks);
							const pingData = JSON.parse(buffer);
							resolve(pingData);
						}
						catch (error) {
							reject(error);
						}
					});
				});

				pingRequest.end();
			}
			catch (error) {
				reject(error);
			}
		});
	},

	startEmbed(serverData, pingData, files) {
		const statusEmbed = new Discord.MessageEmbed();

		// Server Type
		statusEmbed.setAuthor({
			name: 'Minecraft Server',
			url: 'https://www.minecraft.net/',
			iconURL: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/1/12/Grass_Block_JE2.png/revision/latest?cb=20200830142618',
		});

		// Server Name
		if (serverData.name) {
			statusEmbed.setTitle(serverData.name);
		}
		else if (serverData.showAddress) {
			let address = `${serverData.address}`;
			if (serverData.port) {
				address += `:${serverData.port}`;
			}
			statusEmbed.setTitle(address);
		}

		if (serverData.website) {
			statusEmbed.setURL(serverData.website);
		}

		// Server MOTD
		let motd = '';
		if (serverData.description) {
			// statusEmbed.setDescription(`${serverData.description}\n\u200B`);
			motd += serverData.description;
		}
		else if (pingData.motd) {
			// statusEmbed.setDescription(`${pingData.motd}\n\u200B`);
			motd += pingData.motd;
		}

		if (motd != '' && (serverData.showAddress || serverData.bedrock || serverData.mapURL)) {
			motd += '\n\u200B';
		}
		statusEmbed.setDescription(motd);

		// Modpack Field
		if (serverData.showModpack) {
			statusEmbed.addField(
				`${serverData.modpackName} _\`${serverData.modpackVersion}\`_`,
				`${serverData.modpackURL}`,
			);
		}

		// Java Edition Field
		if (serverData.showAddress && serverData.name) {
			let address = `${serverData.address}`;
			if (serverData.port) {
				address += `:${serverData.port}`;
			}

			let version;
			if (serverData.version) {
				version = serverData.version;
			}
			else if (pingData.status == 'success') {
				version = pingData.server.name;
			}
			else {
				version = '?';
			}

			statusEmbed.addField(
				`Java Edition _\`${version}\`_`,
				`Address: \`${address}\``,
			);
		}

		// Bedrock Edition Field
		if (serverData.bedrock) {
			let port;
			if (serverData.bedrockPort) {
				port = serverData.bedrockPort;
			}
			else {
				port = '19132';
			}
			statusEmbed.addField(
				`Bedrock Edition _\`${serverData.bedrockVersion}\`_`,
				`Address: \`${serverData.bedrockAddress}\`\nPort: \`${port}\``,
			);
		}

		// Web Map Field
		if (serverData.mapURL) {
			statusEmbed.addField(
				'Web Map',
				serverData.mapURL,
			);
		}

		// Server Favicon
		if (pingData.favicon) {
			const iconAttachment = ServerUtils.imageUriToAttachment(pingData.favicon, 'server-icon');

			files.push(iconAttachment.attachment);
			statusEmbed.setThumbnail(iconAttachment.reference);
		}
		else if (serverData.icon) {
			statusEmbed.setThumbnail(serverData.icon);
		}
		else {
			statusEmbed.setThumbnail('https://media.minecraftforum.net/attachments/thumbnails/300/619/115/115/636977108000120237.png');
		}

		// Server Status
		if (pingData.status != 'success') {
			statusEmbed.setColor('#888888')
				.addField(
					'\u200B',
					`**Failed to ping server** \u2014 ping status \`${pingData.status}\`: \`\`\`\n${pingData.error}\`\`\``,
				);
		}
		else if (pingData.online) {
			statusEmbed.setColor('#66ff00')
				.addField(
					'\u200B',
					`**ONLINE** \u2014 ${pingData.players.now}/${pingData.players.max} players`,
				);
		}
		else {
			statusEmbed.setColor('#ff3300')
				.addField(
					'\u200B',
					'**_OFFLINE_**',
				);
		}

		return statusEmbed;
	},
};