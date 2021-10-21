const fs = require('fs');
const LoopedList = require('./looped-list');

const embedDirectory = './embed-list';


// Returns file name of self-updating server status embed
function getEmbedFile(message, embedId) {
	return `${message.guild.id}-${message.channel.id}-${embedId}.json`;
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

	// Create self-updating server status embed
	createStatusEmbed(interaction, embedId, serverData) {
		const server = interaction.client.pingTypes.get(serverData.type);

		interaction.reply({ content: `Creating new self-updating status embed with the ID \`${embedId}\`...`, ephemeral: true });

		try {
			server.ping(serverData, function(pingData) {
				const fileArray = [];
				const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

				statusEmbed.setTimestamp()
					.setFooter('Last updated');

				interaction.channel.send({ embeds: [statusEmbed], files: fileArray }).then(sentMessage => {
				// Save embed for later editing
					const embedFile = getEmbedFile(sentMessage, embedId);
					const embedPath = `${embedDirectory}/${embedFile}`;
					let embedData;

					if (fs.existsSync(embedPath)) {
						embedData = JSON.parse(fs.readFileSync(embedPath));
					}
					else {
						embedData = {};
					}

					embedData.id = embedId;
					embedData.messageId = sentMessage.id;
					embedData.server = serverData;

					fs.writeFileSync(embedPath, JSON.stringify(embedData));

					interaction.client.pingList.add(embedFile);

					interaction.editReply({ content: `Successfully created new self-updating status embed with the ID \`${embedId}\``, ephemeral: true });
				});
			});
		}
		catch (error) {
			interaction.editReply({ content: `Failed to create new status embed \`${embedId}\`:\n\`\`\`${error}\`\`\``, ephemeral: true });
		}
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
