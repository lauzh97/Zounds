const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
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
        case 'play':
            await play(interaction);
            break;
        case 'pause':
            break;
        case 'resume':
            break;
        case 'skip':
            break;
        case 'queue':
            break;
        case 'clear':
            break;
        case 'remove':
            break;
        default:
            await interaction.reply("Unrecognized command, /help for a list of available commands.");
            break;
	}
});

function ping(interaction) {
    return interaction.reply("Pong!");
}

// TODO: change to use embed msg instead
function help(interaction) {
    helpTxt  = "```\n";
    helpTxt += "help                - shows this list.\n";
    helpTxt += "ping                - Pong!\n";
    helpTxt += "play [url]          - plays the Youtube video as audio in voice channels. \n";
    helpTxt += "search [keyword]    - search Youtube and return 10 results.\n";
    helpTxt += "pause               - pause the currently playing audio.\n";
    helpTxt += "resume              - resume the currently paused audio.\n";
    helpTxt += "skip                - skip the currently playing audio.\n";
    helpTxt += "queue               - list all the audio to be played.\n";
    helpTxt += "clear               - clear the existing queue.\n";
    helpTxt += "remove [x]          - remove the audio in the x position of the queue.\n";
    helpTxt += "```";

    return interaction.reply(helpTxt);
}

function play(interaction) {
    // console.log(interaction.options.get("url").value);
    return interaction.reply("no function yet.");
}

client.login(token);