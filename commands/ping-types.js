const { displayPingTypes } = require('../server-utils');

module.exports = {
	name: 'ping-types',
	aliases: ['server-ping-types'],
	description: 'Lists all supported server ping types',
	args: false,
	execute(message, args) {
		displayPingTypes(message);
	},
};