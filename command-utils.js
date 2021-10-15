const fs = require('fs');
const Discord = require('discord.js');
const { SlashCommandStringOption } = require('@discordjs/builders');

module.exports = {
	// Returns Discord Collection caontaining all of the command available
	getCommands() {
		const commands = new Discord.Collection();
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);
			commands.set(command.data.name, command);
		}

		return commands;
	},

	// Return slash command option containing the list of available commands as choices
	getCommandOption(name, description, isRequired) {
		const option = new SlashCommandStringOption()
			.setName(name)
			.setDescription(description)
			.setRequired(isRequired);

		const commands = this.getCommands();
		for (const command of commands) {
			option.addChoice(command[1].data.name, command[0]);
		}

		return option;
	},

	// Returns Discord Collection containing all of the pingTypes available
	getPingTypes() {
		const pingTypes = new Discord.Collection();
		const serverTypeFiles = fs.readdirSync('./ping_type').filter(file => file.endsWith('.js'));

		for (const file of serverTypeFiles) {
			const serverType = require(`./ping_type/${file}`);
			pingTypes.set(serverType.value, serverType);
		}

		return pingTypes;
	},

	// Return slash command option containing the list of supported server ping types as choices
	getPingTypesOption(name, description, isRequired) {
		const option = new SlashCommandStringOption()
			.setName(name)
			.setDescription(description)
			.setRequired(isRequired);

		const pingTypes = this.getPingTypes();
		for (const serverType of pingTypes) {
			option.addChoice(serverType[1].name, serverType[0]);
		}

		return option;
	},
};
