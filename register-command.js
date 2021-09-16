const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientID, guildID, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies Pong!'),
	new SlashCommandBuilder().setName('help').setDescription('Replies a list of available commands.'),
	new SlashCommandBuilder().setName('play').setDescription('Plays the Youtube video as audio in voice channel.')
    .addStringOption(option => 
      option.setName('input')
        .setDescription('URL or keyword of the Youtube video.')
        .setRequired(true)),
  new SlashCommandBuilder().setName('search').setDescription('Replies 10 results from searching Youtube.')
    .addStringOption(option =>
      option.setName('keyword')
        .setDescription('Keyword to search.')
        .setRequired(true)),
	new SlashCommandBuilder().setName('pause').setDescription('Pause the currently playing audio.'),
	new SlashCommandBuilder().setName('resume').setDescription('Resume the currently paused audio.'),
	new SlashCommandBuilder().setName('skip').setDescription('Skip the currently playing audio to the next.'),
	new SlashCommandBuilder().setName('queue').setDescription('Replies a list of audios to be played.'),
	new SlashCommandBuilder().setName('clear').setDescription('Clears the existing queue.'),
	new SlashCommandBuilder().setName('remove').setDescription('Removes the audio to be played at x position of the list.')
    .addIntegerOption(option =>
      option.setName('x')
      .setDescription('Position in queue.')
      .setRequired(true)),
	new SlashCommandBuilder().setName('disconnect').setDescription('Disconnect the bot from the channel.')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(clientID, guildID),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();