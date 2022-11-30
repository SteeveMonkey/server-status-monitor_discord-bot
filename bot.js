const Discord = require('discord.js');
const auth = require('./auth.json');
const config = require('./config.json');
const ServerUtils = require('./server-utils');
const CommandUtils = require('./command-utils');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES] });
client.commands = CommandUtils.getCommands();
client.pingTypes = ServerUtils.getPingTypes();
client.pingList = ServerUtils.getPingList();
client.continueStatusEmbedUpdates = true;


// Start
client.once('ready', () => {
	console.log('Ready!');
	continuouslyUpdateStatusEmbeds();
});

// Command Handling
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: `There was an error trying to execute the \`${command.data.name}\` command: \`\`\`\n${error.message}\`\`\``, ephemeral: true });
	}
});

client.login(auth.token);


// Continuously updates all of the status embeds in pingList
async function continuouslyUpdateStatusEmbeds() {
	console.log('Started updating status embeds');

	while (client.continueStatusEmbedUpdates == true) {
		// Update the server status of the current Embed
		const embedFile = client.pingList.get();

		ServerUtils.updateStatusEmbed(client, embedFile).then(() => {
			if (config.verboseLogging) {
				console.log(`Successfully updated status embed \`${embedFile}\``);
			}
		}).catch(error => {
			if (config.verboseLogging) {
				console.log(`Failed to update status embed \`${embedFile}\``);
			}
			console.error(error);
		});

		// Wait before updating next status embed
		await ServerUtils.sleepTimeout(config.pingInterval / client.pingList.size());
	}
}
