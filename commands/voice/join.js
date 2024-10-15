const { SlashCommandBuilder } = require('discord.js');
const { JoinVoiceChannel } = require('./inner/joinVoiceChannel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('join a voice channel!'),
	async execute(interaction) {
        let connection = JoinVoiceChannel(interaction);
        let replyMsg = "joined channel!";

        if (!connection) {
            replyMsg = "failed to join channel!";
        }

		await interaction.reply({
            content: replyMsg,
            ephemeral: true
        });
	},
};