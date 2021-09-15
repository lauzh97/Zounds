const { Client, Intents, MessageEmbed } = require('discord.js');
const { token, prefix } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	switch (commandName) {
        case 'ping':
		    await ping(interaction);
            break;
        case 'help':
            await help(interaction);
            break;
        
	}
});

function ping(interaction) {
    return interaction.reply('Pong!');
}

// TODO: change to use embed msg instead
function help(interaction) {
    helpTxt  = "```\n";
    helpTxt += "help - shows this list.\n";
    helpTxt += "ping - Pong!\n";
    helpTxt += "```";

    return interaction.reply(helpTxt);
}

client.login(token);