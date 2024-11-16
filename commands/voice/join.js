const { SlashCommandBuilder } = require('discord.js');
const { getVoice } = require('./util/voiceUtil');
const { UNABLE_TO_JOIN_CHANNEL } = require('./constant/errMsg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('join a voice channel!'),
	async execute(interaction) {
        let connection = getVoice(interaction);
        let replyMsg = "joined channel!";

        if (!connection) {
            replyMsg = UNABLE_TO_JOIN_CHANNEL;
        }

		await interaction.reply({
            content: replyMsg
        });
	},
};