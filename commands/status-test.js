const ServerEntry = require('../server-utils.js');

module.exports = {
	name: 'status-test',
	description: 'Displays the status of a harcoded server',
	args: false,
	execute(message, args) {
		const serverData = {
			type: 'minecraft',

			name: 'Test Server',
			description: 'Description for Server',
			website: 'http://example.com/',
			icon: 'http://ielts-results.weebly.com/uploads/4/0/6/6/40661105/1113084_orig.jpg',

			java: true,
			javaVersion: '1.15.2',
			javaAddress: 'example.com',
			// javaPort: '12022',

			bedrock: true,
			bedrockVersion: '1.14.60',
			bedrockAddress: 'example.com',
			// bedrockPort: '12010',

			mapURL: 'http://example.com/',
		};

		ServerEntry.displayStatus(message, serverData);
	},
};