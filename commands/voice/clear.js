const { SlashCommandBuilder } = require('discord.js');
const { clearQueue } = require('./util/queueUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('clear the music queue!'),
	async execute(interaction) {
        let replyMsg = "cleared!";

        clearQueue();

		await interaction.reply({
            content: replyMsg,
        });
	},
};