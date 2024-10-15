const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('show bot status!'),
	async execute(interaction) {
        const member = interaction.member.voice.channel;
        const connection = getVoiceConnection(member.guild.id);

        console.log(connection);

		await interaction.reply({
            content: "Please look into console!",
            ephemeral: true
        });
	},
};