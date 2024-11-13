const { SlashCommandBuilder } = require('discord.js');
const { shuffleQueue } = require('./util/queueUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('shuffle the music queue!'),
	async execute(interaction) {
        let replyMsg = "shuffled!";

        shuffleQueue();

		await interaction.reply({
            content: replyMsg
        });
	},
};