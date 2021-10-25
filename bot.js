const Discord = require('discord.js');
const auth = require('./auth.json');
const config = require('./config.json');
const ServerUtils = require('./server-utils');
const CommandUtils = require('./command-utils');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES] });
client.commands = CommandUtils.getCommands();
client.pingTypes = CommandUtils.getPingTypes();
client.pingList = ServerUtils.getPingList();


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

	if (interaction.channel.type !== 'dm') {
		try {
			const permissions = interaction.guild.me.permissionsIn(interaction.channel);

			// message.author.send(`My permissions in the \`${message.channel.name}\` channel on \`${message.guild.name}\` are as follows\n\`\`\`${permissions.serialize()}\`\`\``);

			if (!permissions.has('SEND_MESSAGES')) {
				interaction.author.send(`I am unable to send a message in the \`${interaction.channel.name}\` channel on \`${interaction.guild.name}\`\nPlease make sure I have permission to send messages in that channel`);
				return;
			}
		}
		catch (error) {
			console.error(error);
			interaction.author.send(`There was an error trying to determine permissions: \`${error.name}\` \`\`\`\n${error.message}\`\`\``);
		}
	}

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
function continuouslyUpdateStatusEmbeds() {
	// Schedule the next status embed update
	setTimeout(() => {
		continuouslyUpdateStatusEmbeds();
	}, config.pingInterval / client.pingList.size());

	// Update the server status of the current Embed
	ServerUtils.updateStatusEmbed(client, client.pingList.get());
}
