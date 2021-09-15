const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientID, guildID } = require('./config.json');

const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!'
    },
    {
      name: 'help',
      description: 'Show a list of available commands.'
    }
]; 

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientID, guildID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();