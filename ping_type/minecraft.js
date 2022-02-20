const Discord = require('discord.js');
const ServerUtils = require('../server-utils');
const https = require('https');

module.exports = {
	name: 'Minecraft',
	value: 'minecraft',
	description: 'Used for Minecraft Java Edition servers and can display additional Bedrock Edition info',

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
						const buffer = Buffer.concat(chunks);
						resolve(JSON.parse(buffer));
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
		else {
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

		if (motd != '' && (serverData.java || serverData.bedrock || serverData.mapURL)) {
			motd += '\n\u200B';
		}
		statusEmbed.setDescription(motd);

		// Java Edition Field
		if (serverData.java) {
			let address = `${serverData.javaAddress}`;
			if (serverData.port) {
				address += `:${serverData.port}`;
			}

			let version;
			if (serverData.javaVersion) {
				version = serverData.javaVersion;
			}
			else if (pingData.status == 'success') {
				version = pingData.server.name;
			}
			else {
				version = '?';
			}

			statusEmbed.addField(
				`Java Edition: ${version}`,
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
				`Bedrock Edition: ${serverData.bedrockVersion}`,
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