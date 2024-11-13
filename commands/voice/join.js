const { SlashCommandBuilder } = require('discord.js');
const { joinVoice } = require('./util/voiceUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('join a voice channel!'),
	async execute(interaction) {
        let connection = joinVoice(interaction);
        let replyMsg = "joined channel!";

        if (!connection) {
            replyMsg = "failed to join channel!";
        }

		await interaction.reply({
            content: replyMsg
        });
	},
};