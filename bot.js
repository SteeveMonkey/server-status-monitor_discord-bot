const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const { prefix } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.pingTypes = new Discord.Collection();
const cooldowns = new Discord.Collection();

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
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}
	else {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	if (message.channel.type !== 'dm') {
		try {
			const permissions = message.guild.me.permissionsIn(message.channel);

			// message.author.send(`My permissions in the \`${message.channel.name}\` channel on \`${message.guild.name}\` are as follows\n\`\`\`${permissions.serialize()}\`\`\``);

			if (!permissions.has('SEND_MESSAGES')) {
				message.author.send(`I am unable to send a message in the \`${message.channel.name}\` channel on \`${message.guild.name}\`\nPlease make sure I have permission to send messages in that channel`);
				return;
			}
		}
		catch (error) {
			console.error(error);
			message.author.send(`There was an error trying to determine permissions: \`${error.name}\` \`\`\`\n${error.message}\`\`\``);
		}
	}

	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.channel.send(`There was an error trying to execute the \`${command.name}\` command: \`\`\`\n${error.message}\`\`\``);
	}
});

client.login(auth.token);