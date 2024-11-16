const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');
const { clearQueue } = require('./util/queueUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('pause the current music!'),
	async execute(interaction) {
        let replyMsg = "";
        
        if (AudioPlayerStatus.Idle == global.player.state.status) {
            replyMsg = "no music playing!"
        } else if (AudioPlayerStatus.Paused == global.player.state.status) {
            replyMsg = "already paused!";
        } else {
            global.player.pause();
            replyMsg = "paused! Bot will leave if music is paused over 1 min!";

            // auto-disconnect after 60 seconds of inactivity
            global.inactivityTimeout = setTimeout(() => {
                clearQueue();
                if (getVoice(interaction)) {
                    connection.disconnect();
                }
            }, 60 * 1000);
        }

		await interaction.reply({
            content: replyMsg,
        });
	},
};