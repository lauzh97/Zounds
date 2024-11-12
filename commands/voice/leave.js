const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('leave a voice channel!'),
	async execute(interaction) {
        const member = interaction.member.voice.channel;
        const connection = getVoiceConnection(member.guild.id);
        let replyMsg;

        if (connection) {
            connection.destroy();
            replyMsg = "left channel!"
        } else {
            replyMsg = "not in a channel!"
        }

		await interaction.reply({
            content: replyMsg,
            ephemeral: true
        });
	},
};