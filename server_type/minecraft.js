const Discord = require('discord.js');
const https = require('https');

module.exports = {
	name: 'Minecraft',
	description: 'Used for Minecraft Java Edition servers and can display adidional Bedrock Edition info',

	ping(serverData, pingFinished) {
		let path = `/server/status?ip=${serverData.javaAddress}`;
		if (serverData.javaPort) {
			path += `&port=${serverData.javaPort}`;
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
				console.log(buffer.toString());
				pingFinished(JSON.parse(buffer));
			});
		});

		pingRequest.end();
	},

	startEmbed(serverData, pingData) {
		const statusEmbed = new Discord.MessageEmbed();

		// Server Type
		statusEmbed.setAuthor('Minecraft Server',
			'https://static.wikia.nocookie.net/minecraft_gamepedia/images/1/12/Grass_Block_JE2.png/revision/latest?cb=20200830142618',
			'https://www.minecraft.net/');

		// Server Name
		if (serverData.name) {
			statusEmbed.setTitle(serverData.name);
		}
		else {
			let address = `${serverData.javaAddress}`;
			if (serverData.javaPort) {
				address += `:${serverData.javaPort}`;
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
			if (serverData.javaPort) {
				address += `:${serverData.javaPort}`;
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
			const data = pingData.favicon.split(',')[1];
			const buf = new Buffer.from(data, 'base64');
			const file = new Discord.MessageAttachment(buf, 'server-icon.png');

			statusEmbed.attachFiles(file)
				.setThumbnail('attachment://server-icon.png');
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