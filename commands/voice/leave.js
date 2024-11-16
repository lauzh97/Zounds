const { SlashCommandBuilder } = require('discord.js');
const { getVoice } = require('./util/voiceUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('leave a voice channel!'),
	async execute(interaction) {
        const connection = getVoice(interaction);
        let replyMsg;

        if (connection) {
            connection.destroy();
            replyMsg = "left channel!"
        } else {
            replyMsg = "not in a channel!"
        }

		await interaction.reply({
            content: replyMsg
        });
	},
};