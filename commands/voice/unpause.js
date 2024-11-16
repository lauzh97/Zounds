const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('unpause the current music!'),
	async execute(interaction) {
        let replyMsg = "";
        
        if (AudioPlayerStatus.Idle == global.player.state.status) {
            replyMsg = "no music playing!"
        } else if (AudioPlayerStatus.Paused == global.player.state.status) {
            global.player.unpause();
            replyMsg = "paused!";
        } else {
            replyMsg = "music is not paused!";
        }

		await interaction.reply({
            content: replyMsg,
        });
	},
};