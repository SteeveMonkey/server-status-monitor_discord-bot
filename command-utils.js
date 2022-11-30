const fs = require('fs');
const Discord = require('discord.js');
const { SlashCommandStringOption } = require('@discordjs/builders');
const ServerUtils = require('./server-utils');

module.exports = {
	// Returns Discord Collection containing all of the command available
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

	// Return slash command option containing the list of supported server ping types as choices
	getPingTypesOption(name, description, isRequired) {
		const option = new SlashCommandStringOption()
			.setName(name)
			.setDescription(description)
			.setRequired(isRequired);

		const pingTypes = ServerUtils.getPingTypes();
		for (const serverType of pingTypes) {
			option.addChoice(serverType[1].name, serverType[0]);
		}

		return option;
	},

	// Check for given permission in current channel of the provided interaction
	hasPermission(interaction, permission) {
		const permissions = interaction.guild.me.permissionsIn(interaction.channel);

		return permissions.has(permission);
	},
};
