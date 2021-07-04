const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	aliases: ['commands'],
	description: 'List all commands or displays info about a specific command.',
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		let reply = '';
		const { commands } = message.client;

		if (!args.length) {
			reply += 'Here\'s a list of all my commands:';
			commands.forEach(command => {
				reply += `\n \u2022 ${command.name}`;
			});
			reply += `\n\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`;

			message.author.send(reply)
				.then(() => {
					if (message.channel.type === 'dm') {
						return;
					}
					message.reply('I\'ve sent you a DM with all my commands.');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply(`${message.author} It seems like I can't DM you! Do you have DMs disabled?`);
				});
			return;
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		reply += `**Name:** ${command.name}\n`;

		if (command.aliases) {
			reply += `**Aliases:** ${command.aliases.join(', ')}\n`;
		}
		if (command.description) {
			reply += `**Description:** ${command.description}\n`;
		}
		if (command.usage) {
			reply += `**Usage:** ${prefix}${command.name} ${command.usage}\n`;
		}

		reply += `**Cooldown:** ${command.cooldown || 3} second(s)`;

		message.channel.send(reply);
	},
};