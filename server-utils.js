const fs = require('fs');


// Returns path to self-updating server status embed
function getEmbedPath(message) {
	return `./guilds/${message.guild.id}/channels/${message.channel.id}/embeds`;
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
	createStatusEmbed(interaction, embedId, serverData) {
		const server = interaction.client.pingTypes.get(serverData.type);

		interaction.reply({ content: `Creating new self-updating status embed with the ID \`${embedId}\`...`, ephemeral: true });

		server.ping(serverData, function(pingData) {
			const fileArray = [];
			const statusEmbed = server.startEmbed(serverData, pingData, fileArray);

			statusEmbed.setTimestamp()
				.setFooter('Last updated');

			interaction.channel.send({ embeds: [statusEmbed], files: fileArray }).then(sentMessage => {
				// Save embed for later editing
				let embedPath = getEmbedPath(sentMessage);
				let embedData;

				if (!fs.existsSync(embedPath)) {
					fs.mkdirSync(embedPath, { recursive: true });
				}
				embedPath += `/${embedId}.json`;

				if (fs.existsSync(embedPath)) {
					embedData = require(embedPath);
				}
				else {
					embedData = {};
				}

				embedData.id = embedId;
				embedData.messageId = sentMessage.id;
				embedData.data = serverData;

				fs.writeFileSync(embedPath, JSON.stringify(embedData));

				// TODO: Create entry in ping list

				interaction.editReply({ content: `Successfully created new self-updating status embed with the ID \`${embedId}\``, ephemeral: true });
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
};
