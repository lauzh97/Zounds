const { SlashCommandBuilder } = require('discord.js');
const { joinVoice, getVoice } = require('./util/voiceUtil');
const { playAudio } = require('./util/playUtil')
const { AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');
const { addToQueue, getQueue, addPlaylist, isQueueEmpty, clearQueue } = require('./util/queueUtil');
const { validatePlaylistURL, validateVideoURL } = require('yt-stream');
const { default: YouTube } = require('youtube-sr');
const { UNABLE_TO_JOIN_CHANNEL } = require('./constant/errMsg');

const playIfIdle = async (connection) => {
    if (AudioPlayerStatus.Idle == global.player.state.status) {
        if (isQueueEmpty()) return;

        const currentInfo = playAudio(connection, getQueue().shift());

        return "Added to queue: " + (await currentInfo).title;
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
        await interaction.deferReply();

        const connection = joinVoice(interaction);
        const url = interaction.options.getString("url");
        let replyMsg = "playing!";

        if (!global.player) {
            global.player = createAudioPlayer();
        
            // play next in queue if AudioPlayer is not playing anything
            global.player.on(AudioPlayerStatus.Idle, () => {
                if (!isQueueEmpty()) {
                    playAudio(connection, getQueue().shift());
                } else {
                    // auto-disconnect after 10 seconds of inactivity
                    global.inactivityTimeout = setTimeout(() => {
                        clearQueue();
                        if (getVoice(interaction)) {
                            connection.disconnect();
                        }
                    }, 10 * 1000);
                }
            });
        }

        if (!connection) {
            replyMsg = UNABLE_TO_JOIN_CHANNEL;

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
        
                if (!replyMsg) {
                    replyMsg = "Added playlist to queue";
                }
            })
            .catch(console.error);
        }

        // validate if is video
        const isVideo = validateVideoURL(url);
        if (!isPlaylist) {
            let finalURL = url;
            // not playlist and not video
            // search and return first result
            if (!isVideo) {
                const video = await YouTube.searchOne(url);
                finalURL = video.url;
            }
            addToQueue(finalURL);

            replyMsg = await playIfIdle(connection);
    
            if (!replyMsg) {
                replyMsg = "Added to queue: " + (await YouTube.getVideo(finalURL)).title;
            }
        }

        await interaction.editReply({
            content: replyMsg
        });
	},
};