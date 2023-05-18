const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Disconnect voice channel'),
	async execute(interaction, player) {
        const connection = getVoiceConnection(interaction.member.voice.channel.guild.id);
        connection.destroy();
        return await interaction.reply({ content: 'Disconnected!', ephemeral: true});
    },
};