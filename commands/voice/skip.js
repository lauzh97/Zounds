const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');
const { getVoice } = require('./util/voiceUtil');
const { isQueueEmpty, getQueue, clearQueue } = require('./util/queueUtil');
const { playAudio } = require('./util/playUtil');
const { UNABLE_TO_JOIN_CHANNEL } = require('./constant/errMsg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('skip the current music!'),
	async execute(interaction) {
        const connection = getVoice(interaction);
        let replyMsg = "";

        if (!connection) {
            replyMsg = UNABLE_TO_JOIN_CHANNEL;

            await interaction.reply({
                content: replyMsg,
                ephemeral: true
            });

            return;
        }
        
        if (AudioPlayerStatus.Idle == global.player.state.status) {
            replyMsg = "no music playing!"
        } else {
            if (isQueueEmpty()) {
                global.player.stop();
                replyMsg = "queue ended!";

                // auto-disconnect after 10 seconds of inactivity
                global.inactivityTimeout = setTimeout(() => {
                    clearQueue();
                    if (getVoice(interaction)) {
                        connection.disconnect();
                    }
                }, 10 * 1000);
            } else {
                const ytInfo = playAudio(connection, getQueue().shift());
                replyMsg = "now playing: " + (await ytInfo).title;
            }
        }

		await interaction.reply({
            content: replyMsg,
        });
	},
};