const { SlashCommandBuilder } = require('discord.js');
const { joinVoice } = require('./util/voiceUtil');
const { playAudio } = require('./util/playUtil')
const { AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');
const { addToQueue, getQueue, addPlaylist, isQueueEmpty } = require('./util/queueUtil');
const { validatePlaylistURL, validateVideoURL, getURL } = require('yt-stream');
const { default: YouTube } = require('youtube-sr');

const playIfIdle = async (connection) => {
    if (AudioPlayerStatus.Idle == global.player.state.status) {
        if (isQueueEmpty()) return;

        const ytInfo = playAudio(connection, getQueue().shift());
        return "now playing: " + (await ytInfo).title;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('play some music!')
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

        if (!global.player) {
            global.player = createAudioPlayer();
        }

        if (!connection) {
            replyMsg = "failed to join channel!";

            await interaction.reply({
                content: replyMsg,
                ephemeral: true
            });

            return;
        }

        // validate if is playlist
        const isPlaylist = validatePlaylistURL(url);
        if (isPlaylist) {
            YouTube.getPlaylist(url)
            .then((playlist) => playlist.fetch())
            .then((playlist) => {
                const playlistInfo = playlist.videos.map((video) => video.url);
                addPlaylist(playlistInfo);
                replyMsg = playIfIdle(connection);
            })
            .catch(console.error);
        }

        // validate if is video
        const isVideo = validateVideoURL(url);
        if (!isPlaylist && isVideo) {
            addToQueue(url);
            replyMsg = "added to queue!";
            playIfIdle(connection);
        }
        
        // play next in queue if AudioPlayer is not playing anything
        global.player.on(AudioPlayerStatus.Idle, () => {
            if (!isQueueEmpty()) {
                playAudio(connection, getQueue().shift());
            }
        });

        await interaction.reply({
            content: replyMsg
        });
	},
};