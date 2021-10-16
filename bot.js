const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES] });
client.commands = new Discord.Collection();
client.pingTypes = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const serverTypeFiles = fs.readdirSync('./ping_type').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

for (const file of serverTypeFiles) {
	const serverType = require(`./ping_type/${file}`);
	client.pingTypes.set(serverType.name.toLowerCase(), serverType);
}

// Start
client.once('ready', () => {
	console.log('Ready!');
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
		await interaction.reply(`There was an error trying to execute the \`${command.data.name}\` command: \`\`\`\n${error.message}\`\`\``);
	}
});

client.login(auth.token);