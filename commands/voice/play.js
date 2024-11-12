const { SlashCommandBuilder } = require('discord.js');
const { joinVoice } = require('./util/voiceUtil');
const { playAudio } = require('./util/playUtil')
const { AudioPlayerStatus } = require('@discordjs/voice');
const { addToQueue, getQueue } = require('./util/queueUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('play a youtube video!')
        .addStringOption(option => 
            option
                .setName("url")
                .setDescription("the youtube url")
                .setRequired(true)
        ),
	async execute(interaction) {
        const connection = joinVoice(interaction);
        const url = interaction.options.getString("url");
        let replyMsg = "playing!";

        if (!connection) {
            replyMsg = "failed to join channel!";

            await interaction.reply({
                content: replyMsg,
                ephemeral: true
            });

            return;
        }

        addToQueue(url);

        if (!global.player || AudioPlayerStatus.Idle == global.player.state.status) {
            playAudio(connection, getQueue().shift());
        }

        global.player.on('error', error => {
            console.error(`AudioPlayer error: ${error.message}`);
        });
        
        // todo: somehow this errors when trying to play second music int the list
        global.player.on(AudioPlayerStatus.Idle, () => {
            if (getQueue().length > 0) {
                playAudio(global.player, connection, getQueue().shift());
            } else {
                setTimeout(() => {
                    connection.destroy();
                }, 10 * 1000);  // disconnect after idle for 10 seconds
            }
        });

        await interaction.reply({
            content: replyMsg,
            ephemeral: true
        });
	},
};