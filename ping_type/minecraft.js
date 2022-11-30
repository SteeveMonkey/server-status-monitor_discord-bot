const Discord = require('discord.js');
const ServerUtils = require('../server-utils');
const minecraftServerUtil = require('minecraft-server-util');

module.exports = {
	value: 'minecraft',
	name: 'Minecraft',
	description: 'Used for Minecraft Java Edition servers. Can display Bedrock connection info for servers that also accept Bedrock clients',

	ping(serverData) {
		return new Promise((resolve) => {
			minecraftServerUtil.status(serverData.address, serverData.port).then(pingData => {
				pingData.online = true;
				pingData.motd = pingData.motd.clean;

				resolve(pingData);
			}).catch(error => {
				const pingData = {
					online: false,
					error: error,
				};

				resolve(pingData);
			});
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
			motd += serverData.description;
		}
		else if (pingData.motd) {
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
			else if (pingData.online) {
				version = pingData.version.name;
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
		if (pingData.online) {
			statusEmbed.setColor('#66ff00')
				.addField(
					'\u200B',
					`**ONLINE** \u2014 ${pingData.players.online}/${pingData.players.max} players`,
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